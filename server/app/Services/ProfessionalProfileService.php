<?php

namespace App\Services;

use App\Models\Branch;
use App\Models\ProfessionalProfile;
use App\Models\ProfessionalProfileCertificate;
use App\Models\ProfessionalProfileSpecialty;
use App\Models\Service;
use App\Models\Staff;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProfessionalProfileService
{
    public function __construct(
        private readonly AuditLogService $auditLogService,
        private readonly ProfessionalProfileUsageChecker $usageChecker,
    ) {
    }

    public function listProfiles(array $filters = [])
    {
        $query = ProfessionalProfile::query()
            ->with(['staff.user', 'staff.branch', 'branch', 'certificates', 'specialties'])
            ->withCount('certificates');

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($builder) use ($search) {
                $builder->whereHas('staff', function ($staffQuery) use ($search) {
                    $staffQuery
                        ->where('employee_code', 'like', "%{$search}%")
                        ->orWhere('full_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('certificates', function ($certificateQuery) use ($search) {
                    $certificateQuery->where('certificate_number', 'like', "%{$search}%");
                });
            });
        }

        if (! empty($filters['profile_role']) && $filters['profile_role'] !== 'all') {
            $query->where('profile_role', $filters['profile_role']);
        }

        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        return $query->orderByDesc('updated_at')->paginate($filters['per_page'] ?? 10);
    }

    public function getProfile(int $id): ProfessionalProfile
    {
        return ProfessionalProfile::with([
            'staff.user',
            'staff.branch',
            'branch',
            'approver',
            'invalidator',
            'specialties',
            'certificates.specialty',
        ])->findOrFail($id);
    }

    public function getMyProfile(User $user): ?ProfessionalProfile
    {
        $staff = Staff::where('user_id', $user->id)->first();
        if (! $staff || ! in_array($staff->role_slug, ['bac_si', 'ke_toan'], true)) {
            return null;
        }

        return ProfessionalProfile::with(['staff.user', 'specialties', 'certificates.specialty'])
            ->where('staff_id', $staff->id)
            ->where('profile_role', $staff->role_slug)
            ->first();
    }

    public function getOptions(): array
    {
        return [
            'staff' => Staff::query()
                ->with('branch:id,code,name,city')
                ->whereIn('role_slug', ['bac_si', 'ke_toan'])
                ->whereDoesntHave('professionalProfiles', function ($q) {
                    $q->whereColumn('professional_profiles.profile_role', 'staff.role_slug');
                })
                ->orderBy('full_name')
                ->get(['id', 'employee_code', 'full_name', 'role_slug', 'email', 'status', 'avatar', 'branch_id']),
            'services' => Service::query()->orderBy('name')->get(['id', 'name', 'price']),
            'branches' => Branch::query()->where('status', 'active')->orderBy('name')->get(['id', 'code', 'name', 'city']),
            'degrees' => [
                ['value' => 'cu_nhan', 'label' => 'Cử nhân'],
                ['value' => 'thac_si', 'label' => 'Thạc sĩ'],
                ['value' => 'tien_si', 'label' => 'Tiến sĩ'],
                ['value' => 'pgs_ts', 'label' => 'PGS.TS'],
                ['value' => 'gs_ts', 'label' => 'GS.TS'],
            ],
        ];
    }

    public function createProfile(array $payload, array $uploadedFiles, User $actor): ProfessionalProfile
    {
        return DB::transaction(function () use ($payload, $uploadedFiles, $actor) {
            $staff = Staff::findOrFail($payload['staff_id']);
            $this->assertRoleMatches($staff, $payload['profile_role']);
            $this->assertProfileUniqueness($staff->id, $payload['profile_role']);

            $specialtiesPayload = $this->normalizeSpecialties($payload['specialties'] ?? []);
            $certificatesPayload = $this->normalizeCertificates($payload['certificates'] ?? []);
            $this->assertProfilePayload($payload['profile_role'], $specialtiesPayload, $certificatesPayload);

            $profile = ProfessionalProfile::create([
                'staff_id' => $staff->id,
                'profile_role' => $payload['profile_role'],
                'status' => $payload['status'] ?? ProfessionalProfile::STATUS_DRAFT,
                'notes' => $payload['notes'] ?? null,
                'degree' => $payload['degree'] ?? null,
                'years_experience' => $payload['years_experience'] ?? null,
                'branch_id' => $payload['branch_id'] ?? null,
                'service_scope' => $this->normalizeServiceScope($payload['service_scope'] ?? null),
                'rejection_reason' => null,
                'is_active' => true,
            ]);

            $this->syncProfileRelations($profile, $payload['profile_role'], $specialtiesPayload, $certificatesPayload, $uploadedFiles);
            $this->refreshComputedStatus($profile);

            $this->auditLogService->log($actor, 'professional_profile.created', [
                'profile_id' => $profile->id,
                'staff_id' => $profile->staff_id,
                'profile_role' => $profile->profile_role,
                'status' => $profile->status,
            ]);

            return $this->getProfile($profile->id);
        });
    }

    public function updateProfile(ProfessionalProfile $profile, array $payload, array $uploadedFiles, User $actor, bool $selfService = false): ProfessionalProfile
    {
        return DB::transaction(function () use ($profile, $payload, $uploadedFiles, $actor, $selfService) {
            $before = $this->snapshot($profile);
            $staff = $profile->staff;

            if (! $selfService && isset($payload['staff_id']) && (int) $payload['staff_id'] !== $profile->staff_id) {
                $staff = Staff::findOrFail($payload['staff_id']);
                $this->assertRoleMatches($staff, $payload['profile_role'] ?? $profile->profile_role);
                $profile->staff_id = $staff->id;
            }

            $nextRole = $payload['profile_role'] ?? $profile->profile_role;
            $this->assertRoleMatches($staff, $nextRole);

            $specialtiesPayload = $this->normalizeSpecialties($payload['specialties'] ?? $profile->specialties->toArray());
            $certificatesPayload = $this->normalizeCertificates($payload['certificates'] ?? $profile->certificates->toArray());
            $this->assertProfilePayload($nextRole, $specialtiesPayload, $certificatesPayload, $profile->id);

            $profile->fill([
                'profile_role' => $nextRole,
                'notes' => $payload['notes'] ?? $profile->notes,
                'degree' => array_key_exists('degree', $payload) ? $payload['degree'] : $profile->degree,
                'years_experience' => array_key_exists('years_experience', $payload) ? $payload['years_experience'] : $profile->years_experience,
                'branch_id' => array_key_exists('branch_id', $payload) ? $payload['branch_id'] : $profile->branch_id,
                'service_scope' => array_key_exists('service_scope', $payload)
                    ? $this->normalizeServiceScope($payload['service_scope'])
                    : $profile->service_scope,
            ]);

            if (! $selfService && isset($payload['status']) && in_array($payload['status'], [ProfessionalProfile::STATUS_DRAFT, ProfessionalProfile::STATUS_PENDING], true)) {
                $profile->status = $payload['status'];
            }

            if ($selfService) {
                $profile->status = ProfessionalProfile::STATUS_PENDING;
                $profile->submitted_at = now();
                $profile->rejection_reason = null;
                $profile->approved_at = null;
                $profile->approved_by = null;
            }

            $profile->save();
            $this->syncProfileRelations($profile, $nextRole, $specialtiesPayload, $certificatesPayload, $uploadedFiles);
            $this->refreshComputedStatus($profile);

            $this->auditLogService->log($actor, $selfService ? 'professional_profile.self_updated' : 'professional_profile.updated', [
                'profile_id' => $profile->id,
                'before' => $before,
                'after' => $this->snapshot($profile->fresh(['specialties', 'certificates'])),
            ]);

            return $this->getProfile($profile->id);
        });
    }

    public function submitForApproval(ProfessionalProfile $profile, User $actor): ProfessionalProfile
    {
        return DB::transaction(function () use ($profile, $actor) {
            $this->assertSubmittable($profile);
            $before = $this->snapshot($profile);

            $profile->update([
                'status' => ProfessionalProfile::STATUS_PENDING,
                'submitted_at' => now(),
                'rejection_reason' => null,
                'approved_at' => null,
                'approved_by' => null,
                'is_active' => true,
            ]);

            $this->auditLogService->log($actor, 'professional_profile.submitted', [
                'profile_id' => $profile->id,
                'before' => $before,
                'after' => $this->snapshot($profile),
            ]);

            return $this->getProfile($profile->id);
        });
    }

    public function approve(ProfessionalProfile $profile, User $actor): ProfessionalProfile
    {
        return DB::transaction(function () use ($profile, $actor) {
            $this->assertApprovable($profile);
            $before = $this->snapshot($profile);

            $profile->update([
                'status' => ProfessionalProfile::STATUS_APPROVED,
                'approved_at' => now(),
                'approved_by' => $actor->id,
                'rejection_reason' => null,
                'is_active' => true,
            ]);

            $this->auditLogService->log($actor, 'professional_profile.approved', [
                'profile_id' => $profile->id,
                'before' => $before,
                'after' => $this->snapshot($profile),
            ]);

            return $this->getProfile($profile->id);
        });
    }

    public function reject(ProfessionalProfile $profile, string $reason, User $actor): ProfessionalProfile
    {
        return DB::transaction(function () use ($profile, $reason, $actor) {
            if (trim($reason) === '') {
                throw ValidationException::withMessages([
                    'reason' => 'Vui long nhap ly do tu choi.',
                ]);
            }

            $before = $this->snapshot($profile);

            $profile->update([
                'status' => ProfessionalProfile::STATUS_REJECTED,
                'rejection_reason' => $reason,
                'approved_at' => null,
                'approved_by' => null,
            ]);

            $this->auditLogService->log($actor, 'professional_profile.rejected', [
                'profile_id' => $profile->id,
                'before' => $before,
                'after' => $this->snapshot($profile),
            ]);

            return $this->getProfile($profile->id);
        });
    }

    public function invalidate(ProfessionalProfile $profile, User $actor): ProfessionalProfile
    {
        return DB::transaction(function () use ($profile, $actor) {
            if ($this->usageChecker->isInUse($profile)) {
                throw ValidationException::withMessages([
                    'profile' => 'Khong the vo hieu hoa ho so dang duoc su dung.',
                ]);
            }

            $before = $this->snapshot($profile);

            $profile->update([
                'status' => ProfessionalProfile::STATUS_INACTIVE,
                'is_active' => false,
                'invalidated_at' => now(),
                'invalidated_by' => $actor->id,
            ]);

            $this->auditLogService->log($actor, 'professional_profile.invalidated', [
                'profile_id' => $profile->id,
                'before' => $before,
                'after' => $this->snapshot($profile),
            ]);

            return $this->getProfile($profile->id);
        });
    }

    public function getHistory(ProfessionalProfile $profile)
    {
        return \App\Models\AuditLog::query()
            ->where('details', 'like', '%"profile_id":' . $profile->id . '%')
            ->orderByDesc('created_at')
            ->get();
    }

    public function expireProfiles(): int
    {
        $count = 0;

        ProfessionalProfile::with(['certificates', 'staff.user'])
            ->whereIn('status', [ProfessionalProfile::STATUS_PENDING, ProfessionalProfile::STATUS_APPROVED])
            ->chunk(50, function (Collection $profiles) use (&$count) {
                foreach ($profiles as $profile) {
                    if (! $profile->certificates->contains(fn ($certificate) => $certificate->is_expired)) {
                        continue;
                    }

                    $before = $this->snapshot($profile);
                    $profile->update([
                        'status' => ProfessionalProfile::STATUS_EXPIRED,
                        'is_active' => false,
                    ]);

                    $this->auditLogService->log(null, 'professional_profile.expired', [
                        'profile_id' => $profile->id,
                        'before' => $before,
                        'after' => $this->snapshot($profile),
                    ]);
                    $count++;
                }
            });

        return $count;
    }

    public function assertSelfServiceAccess(User $user, ProfessionalProfile $profile): void
    {
        $staff = Staff::where('user_id', $user->id)->first();
        if (! $staff || $profile->staff_id !== $staff->id) {
            abort(403, 'Ban khong co quyen truy cap ho so nay.');
        }
    }

    public function validateSelfServicePayloadKeys(array $inputKeys): void
    {
        $allowed = [
            'notes',
            'specialties',
            'certificates',
            'certificate_files',
            '_method',
        ];

        $forbidden = array_values(array_diff($inputKeys, $allowed));
        if ($forbidden !== []) {
            throw ValidationException::withMessages([
                'fields' => 'Ban khong duoc sua cac truong: ' . implode(', ', $forbidden),
            ]);
        }
    }

    private function syncProfileRelations(ProfessionalProfile $profile, string $profileRole, array $specialtiesPayload, array $certificatesPayload, array $uploadedFiles): void
    {
        $existingSpecialtyIds = [];
        $specialtyMap = [];

        if ($profileRole === 'bac_si') {
            foreach ($specialtiesPayload as $specialtyPayload) {
                $specialty = ProfessionalProfileSpecialty::updateOrCreate(
                    [
                        'id' => $specialtyPayload['id'] ?? null,
                        'professional_profile_id' => $profile->id,
                    ],
                    [
                        'specialty_name' => $specialtyPayload['specialty_name'],
                        'degree' => $specialtyPayload['degree'] ?? null,
                        'years_experience' => (int) ($specialtyPayload['years_experience'] ?? 0),
                        'service_scope' => array_values($specialtyPayload['service_scope'] ?? []),
                        'branch_or_room' => $specialtyPayload['branch_or_room'] ?? null,
                        'notes' => $specialtyPayload['notes'] ?? null,
                    ]
                );
                $existingSpecialtyIds[] = $specialty->id;

                if (! empty($specialtyPayload['client_key'])) {
                    $specialtyMap[$specialtyPayload['client_key']] = $specialty->id;
                }
            }

            $profile->specialties()->whereNotIn('id', $existingSpecialtyIds ?: [0])->delete();
        } else {
            $profile->specialties()->delete();
        }

        $existingCertificateIds = [];

        foreach ($certificatesPayload as $index => $certificatePayload) {
            $specialtyId = $certificatePayload['professional_profile_specialty_id'] ?? null;
            if (! $specialtyId && ! empty($certificatePayload['specialty_client_key'])) {
                $specialtyId = $specialtyMap[$certificatePayload['specialty_client_key']] ?? null;
            }

            $attributes = [
                'professional_profile_id' => $profile->id,
                'professional_profile_specialty_id' => $specialtyId,
                'certificate_type' => $certificatePayload['certificate_type'],
                'certificate_name' => $certificatePayload['certificate_name'],
                'certificate_number' => $certificatePayload['certificate_number'],
                'issued_date' => $certificatePayload['issued_date'] ?? null,
                'expiry_date' => $certificatePayload['expiry_date'] ?? null,
                'issuer' => $certificatePayload['issuer'] ?? null,
                'scope_label' => $certificatePayload['scope_label'] ?? null,
                'notes' => $certificatePayload['notes'] ?? null,
                'is_primary' => (bool) ($certificatePayload['is_primary'] ?? false),
            ];

            $certificate = null;
            if (! empty($certificatePayload['id'])) {
                $certificate = $profile->certificates()->find($certificatePayload['id']);
            }

            $file = $uploadedFiles[$index] ?? null;
            if (! $certificate && ! $file) {
                throw ValidationException::withMessages([
                    "certificates.$index.file" => 'Tai lieu dinh kem la bat buoc.',
                ]);
            }

            if ($file instanceof UploadedFile) {
                if ($certificate && $certificate->file_path) {
                    Storage::disk('local')->delete($certificate->file_path);
                }

                $storedPath = $file->store('private/professional-profiles', 'local');
                $attributes = array_merge($attributes, [
                    'file_path' => $storedPath,
                    'file_name' => $file->getClientOriginalName(),
                    'file_mime' => $file->getMimeType() ?: 'application/octet-stream',
                    'file_size' => $file->getSize(),
                ]);
            }

            $certificate = ProfessionalProfileCertificate::updateOrCreate(
                [
                    'id' => $certificate?->id,
                    'professional_profile_id' => $profile->id,
                ],
                $attributes + [
                    'file_path' => $certificate?->file_path,
                    'file_name' => $certificate?->file_name,
                    'file_mime' => $certificate?->file_mime,
                    'file_size' => $certificate?->file_size,
                ]
            );

            $existingCertificateIds[] = $certificate->id;
        }

        $profile->certificates()
            ->whereNotIn('id', $existingCertificateIds ?: [0])
            ->get()
            ->each(function (ProfessionalProfileCertificate $certificate) {
                Storage::disk('local')->delete($certificate->file_path);
                $certificate->delete();
            });
    }

    private function refreshComputedStatus(ProfessionalProfile $profile): void
    {
        $profile->loadMissing('certificates');

        if ($profile->certificates->contains(fn ($certificate) => $certificate->is_expired)) {
            $profile->update([
                'status' => ProfessionalProfile::STATUS_EXPIRED,
                'is_active' => false,
            ]);
        }
    }

    private function assertRoleMatches(Staff $staff, string $role): void
    {
        if ($staff->role_slug !== $role) {
            throw ValidationException::withMessages([
                'profile_role' => 'Vai tro ho so chuyen mon khong khop voi ho so nhan su.',
            ]);
        }
    }

    private function assertProfileUniqueness(int $staffId, string $role): void
    {
        if (ProfessionalProfile::where('staff_id', $staffId)->where('profile_role', $role)->exists()) {
            throw ValidationException::withMessages([
                'staff_id' => 'Nhan su nay da co ho so chuyen mon cho vai tro da chon.',
            ]);
        }
    }

    private function assertProfilePayload(string $role, array $specialtiesPayload, array $certificatesPayload, ?int $profileId = null): void
    {
        if ($certificatesPayload === []) {
            throw ValidationException::withMessages([
                'certificates' => 'Can it nhat mot chung chi hoac tai lieu lien quan.',
            ]);
        }

        if ($role === 'bac_si' && $specialtiesPayload === []) {
            throw ValidationException::withMessages([
                'specialties' => 'Bac si phai co it nhat mot chuyen mon.',
            ]);
        }

        $numbers = [];
        foreach ($certificatesPayload as $index => $certificatePayload) {
            $number = trim((string) ($certificatePayload['certificate_number'] ?? ''));
            if ($number === '') {
                throw ValidationException::withMessages([
                    "certificates.$index.certificate_number" => 'So chung chi la bat buoc.',
                ]);
            }

            $compound = ($certificatePayload['certificate_type'] ?? '') . '|' . $number;
            if (isset($numbers[$compound])) {
                throw ValidationException::withMessages([
                    "certificates.$index.certificate_number" => 'So chung chi bi trung trong cung ho so.',
                ]);
            }
            $numbers[$compound] = true;

            $query = ProfessionalProfileCertificate::query()
                ->where('certificate_type', $certificatePayload['certificate_type'] ?? '')
                ->where('certificate_number', $number);

            if (! empty($certificatePayload['id'])) {
                $query->where('id', '!=', $certificatePayload['id']);
            }

            if ($profileId) {
                $query->where('professional_profile_id', '!=', $profileId);
            }

            if ($query->exists()) {
                throw ValidationException::withMessages([
                    "certificates.$index.certificate_number" => 'So chung chi da ton tai.',
                ]);
            }
        }
    }

    private function assertApprovable(ProfessionalProfile $profile): void
    {
        $profile->loadMissing('certificates');

        if ($profile->certificates->contains(fn ($certificate) => $certificate->is_expired)) {
            throw ValidationException::withMessages([
                'status' => 'Khong the duyet ho so co chung chi da het han.',
            ]);
        }
    }

    private function assertSubmittable(ProfessionalProfile $profile): void
    {
        $profile->loadMissing('specialties', 'certificates');
        $this->assertProfilePayload($profile->profile_role, $profile->specialties->toArray(), $profile->certificates->toArray(), $profile->id);
    }

    private function normalizeSpecialties(array $specialties): array
    {
        return array_values(array_map(function ($specialty) {
            return [
                'id' => Arr::get($specialty, 'id'),
                'client_key' => Arr::get($specialty, 'client_key'),
                'specialty_name' => trim((string) Arr::get($specialty, 'specialty_name', '')),
                'degree' => Arr::get($specialty, 'degree'),
                'years_experience' => (int) Arr::get($specialty, 'years_experience', 0),
                'service_scope' => Arr::get($specialty, 'service_scope', []),
                'branch_or_room' => Arr::get($specialty, 'branch_or_room'),
                'notes' => Arr::get($specialty, 'notes'),
            ];
        }, array_filter($specialties, fn ($specialty) => ! empty(Arr::get($specialty, 'specialty_name')))));
    }

    private function normalizeCertificates(array $certificates): array
    {
        return array_values(array_map(function ($certificate) {
            return [
                'id' => Arr::get($certificate, 'id'),
                'professional_profile_specialty_id' => Arr::get($certificate, 'professional_profile_specialty_id'),
                'specialty_client_key' => Arr::get($certificate, 'specialty_client_key'),
                'certificate_type' => trim((string) Arr::get($certificate, 'certificate_type', '')),
                'certificate_name' => trim((string) Arr::get($certificate, 'certificate_name', '')),
                'certificate_number' => trim((string) Arr::get($certificate, 'certificate_number', '')),
                'issued_date' => Arr::get($certificate, 'issued_date'),
                'expiry_date' => Arr::get($certificate, 'expiry_date'),
                'issuer' => Arr::get($certificate, 'issuer'),
                'scope_label' => Arr::get($certificate, 'scope_label'),
                'notes' => Arr::get($certificate, 'notes'),
                'is_primary' => (bool) Arr::get($certificate, 'is_primary', false),
            ];
        }, array_filter($certificates, fn ($certificate) => ! empty(Arr::get($certificate, 'certificate_name')))));
    }

    private function normalizeServiceScope($value): ?array
    {
        if ($value === null) {
            return null;
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);
            $value = is_array($decoded) ? $decoded : [];
        }

        if (! is_array($value)) {
            return null;
        }

        $clean = collect($value)
            ->map(fn ($item) => is_array($item) ? Arr::get($item, 'name') ?? Arr::get($item, 'value') : $item)
            ->map(fn ($item) => is_string($item) ? trim($item) : null)
            ->filter()
            ->unique()
            ->values()
            ->all();

        return empty($clean) ? null : $clean;
    }

    private function snapshot(ProfessionalProfile $profile): array
    {
        $profile->loadMissing('specialties', 'certificates');

        return [
            'id' => $profile->id,
            'staff_id' => $profile->staff_id,
            'profile_role' => $profile->profile_role,
            'status' => $profile->status,
            'notes' => $profile->notes,
            'degree' => $profile->degree,
            'years_experience' => $profile->years_experience,
            'branch_id' => $profile->branch_id,
            'service_scope' => $profile->service_scope,
            'rejection_reason' => $profile->rejection_reason,
            'submitted_at' => $profile->submitted_at?->toISOString(),
            'approved_at' => $profile->approved_at?->toISOString(),
            'invalidated_at' => $profile->invalidated_at?->toISOString(),
            'specialties' => $profile->specialties->map(fn ($specialty) => [
                'id' => $specialty->id,
                'specialty_name' => $specialty->specialty_name,
                'degree' => $specialty->degree,
                'years_experience' => $specialty->years_experience,
                'service_scope' => $specialty->service_scope,
                'branch_or_room' => $specialty->branch_or_room,
                'notes' => $specialty->notes,
            ])->values()->all(),
            'certificates' => $profile->certificates->map(fn ($certificate) => [
                'id' => $certificate->id,
                'certificate_type' => $certificate->certificate_type,
                'certificate_name' => $certificate->certificate_name,
                'certificate_number' => $certificate->certificate_number,
                'issued_date' => $certificate->issued_date?->toDateString(),
                'expiry_date' => $certificate->expiry_date?->toDateString(),
                'scope_label' => $certificate->scope_label,
                'is_primary' => $certificate->is_primary,
            ])->values()->all(),
        ];
    }
}
