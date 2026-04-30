<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\ProfessionalProfile;
use App\Models\Service;
use App\Models\ServiceAttachment;
use App\Models\ServicePriceHistory;
use App\Models\ServiceStatusHistory;
use App\Models\Specialty;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ServiceCatalogService
{
    public function __construct(private readonly AuditLogService $auditLog)
    {
    }

    public function listServices(array $filters): LengthAwarePaginator
    {
        $query = Service::query()
            ->with(['group', 'specialties', 'creator:id,name', 'updater:id,name'])
            ->withCount('attachments');

        if (! empty($filters['search'])) {
            $term = '%'.$filters['search'].'%';
            $query->where(function ($q) use ($term) {
                $q->where('service_code', 'like', $term)
                    ->orWhere('name', 'like', $term);
            });
        }

        if (! empty($filters['service_group_id']) && $filters['service_group_id'] !== 'all') {
            $query->where('service_group_id', $filters['service_group_id']);
        }

        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['visibility']) && $filters['visibility'] !== 'all') {
            $query->where('visibility', $filters['visibility']);
        }

        if (! empty($filters['specialty_id']) && $filters['specialty_id'] !== 'all') {
            $specialtyId = (int) $filters['specialty_id'];
            $query->whereHas('specialties', function ($q) use ($specialtyId) {
                $q->where('specialties.id', $specialtyId)
                    ->where('service_specialty.is_primary', true);
            });
        }

        $perPage = (int) ($filters['per_page'] ?? 20);

        return $query->orderBy('id', 'desc')->paginate(min($perPage, 100));
    }

    public function findService(int $id, bool $publicAttachmentsOnly = false): Service
    {
        $attachmentLoader = $publicAttachmentsOnly
            ? [
                'attachments' => fn ($q) => $q
                    ->where('visibility', ServiceAttachment::VISIBILITY_PUBLIC)
                    ->with('uploader:id,name'),
            ]
            : ['attachments.uploader:id,name'];

        return Service::with(array_merge([
            'group',
            'specialties',
            'priceHistory.changer:id,name',
            'statusHistory.changer:id,name',
            'creator:id,name',
            'updater:id,name',
        ], $attachmentLoader))->findOrFail($id);
    }

    public function publicListServices(array $filters): LengthAwarePaginator
    {
        $filters['visibility'] = Service::VISIBILITY_PUBLIC;
        $filters['status'] = Service::STATUS_ACTIVE;

        return $this->listServices($filters);
    }

    public function createService(array $data, ?User $actor): Service
    {
        $payload = $this->sanitizePayload($data, isUpdate: false);
        $specialties = $this->validateSpecialties($data);
        $this->ensureUniqueCode($payload['service_code']);
        $this->ensureUniqueNameWithinGroup($payload['name'], $payload['service_group_id'] ?? null);
        $this->validateStatusTransition(null, $payload['status'], $payload, $specialties);

        return DB::transaction(function () use ($payload, $specialties, $data, $actor) {
            $payload['created_by'] = $actor?->id;
            $payload['updated_by'] = $actor?->id;
            $service = Service::create($payload);

            $this->syncSpecialties($service, $specialties);

            ServicePriceHistory::create([
                'service_id' => $service->id,
                'old_price' => null,
                'new_price' => $payload['price'] ?? 0,
                'effective_date' => now()->toDateString(),
                'reason' => 'Tao moi dich vu',
                'changed_by' => $actor?->id,
                'created_at' => now(),
            ]);

            ServiceStatusHistory::create([
                'service_id' => $service->id,
                'old_status' => null,
                'new_status' => $payload['status'],
                'reason' => $data['status_reason'] ?? 'Tao moi',
                'changed_by' => $actor?->id,
                'created_at' => now(),
            ]);

            $this->auditLog->log($actor, 'service.created', [
                'service_id' => $service->id,
                'service_code' => $service->service_code,
                'name' => $service->name,
                'status' => $service->status,
            ]);

            return $service->fresh(['group', 'specialties', 'attachments']);
        });
    }

    public function updateService(int $id, array $data, ?User $actor): Service
    {
        $service = Service::findOrFail($id);

        $payload = $this->sanitizePayload($data, isUpdate: true, current: $service);
        $specialties = $this->validateSpecialties($data, fallback: $service);

        if (! empty($payload['service_code']) && $payload['service_code'] !== $service->service_code) {
            $this->ensureUniqueCode($payload['service_code'], excludeId: $service->id);
        }

        if (! empty($payload['name']) || array_key_exists('service_group_id', $payload)) {
            $this->ensureUniqueNameWithinGroup(
                $payload['name'] ?? $service->name,
                $payload['service_group_id'] ?? $service->service_group_id,
                excludeId: $service->id
            );
        }

        $newStatus = $payload['status'] ?? $service->status;
        $this->validateStatusTransition($service->status, $newStatus, array_merge($service->toArray(), $payload), $specialties);

        return DB::transaction(function () use ($service, $payload, $specialties, $data, $actor) {
            $oldPrice = (float) $service->price;
            $oldStatus = $service->status;

            $payload['updated_by'] = $actor?->id;
            $service->fill($payload)->save();

            $this->syncSpecialties($service, $specialties);

            if (array_key_exists('price', $payload) && (float) $payload['price'] !== $oldPrice) {
                ServicePriceHistory::create([
                    'service_id' => $service->id,
                    'old_price' => $oldPrice,
                    'new_price' => $payload['price'],
                    'effective_date' => $data['price_effective_date'] ?? now()->toDateString(),
                    'reason' => $data['price_reason'] ?? 'Cap nhat gia',
                    'changed_by' => $actor?->id,
                    'created_at' => now(),
                ]);
            }

            if (! empty($payload['status']) && $payload['status'] !== $oldStatus) {
                ServiceStatusHistory::create([
                    'service_id' => $service->id,
                    'old_status' => $oldStatus,
                    'new_status' => $payload['status'],
                    'reason' => $data['status_reason'] ?? null,
                    'changed_by' => $actor?->id,
                    'created_at' => now(),
                ]);
            }

            $this->auditLog->log($actor, 'service.updated', [
                'service_id' => $service->id,
                'service_code' => $service->service_code,
                'changes' => array_keys($payload),
            ]);

            return $service->fresh(['group', 'specialties', 'attachments']);
        });
    }

    public function changeStatus(int $id, string $newStatus, ?string $reason, ?User $actor): Service
    {
        if (! in_array($newStatus, Service::STATUSES, true)) {
            throw ValidationException::withMessages([
                'status' => 'Trang thai khong hop le (E9).',
            ]);
        }

        $service = Service::with('specialties')->findOrFail($id);
        $oldStatus = $service->status;
        if ($oldStatus === $newStatus) {
            return $service;
        }

        $specialties = $service->specialties->map(fn ($s) => [
            'id' => $s->id,
            'is_primary' => (bool) $s->pivot->is_primary,
        ])->toArray();

        $this->validateStatusTransition($oldStatus, $newStatus, $service->toArray(), $specialties);

        if (in_array($newStatus, [Service::STATUS_HIDDEN, Service::STATUS_DISCONTINUED], true)
            && $this->serviceHasActiveUsage($service->id)
        ) {
            throw ValidationException::withMessages([
                'status' => 'Dich vu dang co lich kham/ho so dieu tri lien quan, khong the Tam an/Ngung ap dung (E5).',
            ]);
        }

        return DB::transaction(function () use ($service, $oldStatus, $newStatus, $reason, $actor) {
            $service->status = $newStatus;
            $service->updated_by = $actor?->id;
            $service->save();

            ServiceStatusHistory::create([
                'service_id' => $service->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'reason' => $reason,
                'changed_by' => $actor?->id,
                'created_at' => now(),
            ]);

            $this->auditLog->log($actor, 'service.status_changed', [
                'service_id' => $service->id,
                'service_code' => $service->service_code,
                'from' => $oldStatus,
                'to' => $newStatus,
                'reason' => $reason,
            ]);

            return $service->fresh(['specialties', 'group']);
        });
    }

    public function deleteService(int $id, ?User $actor): void
    {
        $service = Service::findOrFail($id);

        if ($this->serviceHasActiveUsage($service->id)) {
            throw ValidationException::withMessages([
                'service_id' => 'Dich vu da phat sinh du lieu, khong the xoa. Vui long Tam an hoac Ngung ap dung (E6).',
            ]);
        }

        DB::transaction(function () use ($service, $actor) {
            $this->auditLog->log($actor, 'service.deleted', [
                'service_id' => $service->id,
                'service_code' => $service->service_code,
                'name' => $service->name,
            ]);
            $service->delete();
        });
    }

    /**
     * Whether the service is referenced by appointments / dental records.
     * Hook for the future appointments module; returns false for now.
     */
    public function serviceHasActiveUsage(int $serviceId): bool
    {
        // Placeholder: when appointments/dental_records modules attach services,
        // check those tables here. Currently no such relations exist.
        return false;
    }

    private function syncSpecialties(Service $service, array $specialties): void
    {
        $sync = [];
        foreach ($specialties as $entry) {
            $sync[$entry['id']] = ['is_primary' => $entry['is_primary']];
        }
        $service->specialties()->sync($sync);
    }

    /**
     * @return array<int, array{id:int, is_primary:bool}>
     */
    private function validateSpecialties(array $data, ?Service $fallback = null): array
    {
        if (! array_key_exists('specialty_ids', $data) && $fallback) {
            return $fallback->specialties->map(fn ($s) => [
                'id' => $s->id,
                'is_primary' => (bool) $s->pivot->is_primary,
            ])->toArray();
        }

        $ids = collect($data['specialty_ids'] ?? [])->map(fn ($v) => (int) $v)->unique()->values();
        $primaryId = isset($data['primary_specialty_id']) ? (int) $data['primary_specialty_id'] : null;

        if ($ids->isEmpty()) {
            return [];
        }

        $existing = Specialty::whereIn('id', $ids)->where('is_active', true)->pluck('id')->toArray();
        $missing = $ids->diff($existing);
        if ($missing->isNotEmpty()) {
            throw ValidationException::withMessages([
                'specialty_ids' => 'Co chuyen mon khong ton tai hoac da khoa: '.$missing->implode(', '),
            ]);
        }

        if ($primaryId && ! $ids->contains($primaryId)) {
            throw ValidationException::withMessages([
                'primary_specialty_id' => 'Chuyen mon chinh phai nam trong danh sach chuyen mon yeu cau (E8).',
            ]);
        }

        $primaryId = $primaryId ?: (int) $ids->first();

        return $ids->map(fn ($id) => [
            'id' => (int) $id,
            'is_primary' => (int) $id === $primaryId,
        ])->all();
    }

    private function ensureUniqueCode(string $code, ?int $excludeId = null): void
    {
        $query = Service::where('service_code', $code);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        if ($query->exists()) {
            throw ValidationException::withMessages([
                'service_code' => 'Ma dich vu da ton tai (E1).',
            ]);
        }
    }

    private function ensureUniqueNameWithinGroup(string $name, ?int $groupId, ?int $excludeId = null): void
    {
        $query = Service::where('name', $name);
        if ($groupId) {
            $query->where('service_group_id', $groupId);
        } else {
            $query->whereNull('service_group_id');
        }
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        if ($query->exists()) {
            throw ValidationException::withMessages([
                'name' => 'Ten dich vu da ton tai trong cung nhom (E2).',
            ]);
        }
    }

    /**
     * @param  array<int, array{id:int, is_primary:bool}>  $specialties
     */
    private function validateStatusTransition(?string $oldStatus, string $newStatus, array $payload, array $specialties): void
    {
        if (! in_array($newStatus, Service::STATUSES, true)) {
            throw ValidationException::withMessages([
                'status' => 'Trang thai khong hop le (E9).',
            ]);
        }

        if ($newStatus === Service::STATUS_ACTIVE) {
            $price = (float) ($payload['price'] ?? 0);
            if ($price <= 0) {
                throw ValidationException::withMessages([
                    'price' => 'Khong the chuyen sang Dang ap dung khi chua co gia (E3).',
                ]);
            }

            if (empty($specialties)) {
                throw ValidationException::withMessages([
                    'specialty_ids' => 'Phai co it nhat mot chuyen mon de chuyen sang Dang ap dung (E3).',
                ]);
            }

            $primary = collect($specialties)->firstWhere('is_primary', true);
            if (! $primary) {
                throw ValidationException::withMessages([
                    'primary_specialty_id' => 'Phai chon chuyen mon chinh truoc khi Dang ap dung.',
                ]);
            }

            if (! $this->doctorAvailableForSpecialty((int) $primary['id'])) {
                throw ValidationException::withMessages([
                    'specialty_ids' => 'Khong co bac si voi chuyen mon phu hop de trien khai dich vu (E4).',
                ]);
            }
        }
    }

    private function doctorAvailableForSpecialty(int $specialtyId): bool
    {
        $specialty = Specialty::find($specialtyId);
        if (! $specialty) {
            return false;
        }

        $names = array_values(array_unique(array_filter([
            $specialty->name,
            Str::ascii((string) $specialty->name),
        ])));

        return ProfessionalProfile::query()
            ->where('profile_role', 'bac_si')
            ->where('status', ProfessionalProfile::STATUS_APPROVED)
            ->where('is_active', true)
            ->whereHas('specialties', function ($q) use ($names) {
                $q->whereIn('specialty_name', $names);
            })
            ->whereHas('staff', fn ($q) => $q->where('status', 'working'))
            ->exists();
    }

    /**
     * @return array<string, mixed>
     */
    private function sanitizePayload(array $data, bool $isUpdate, ?Service $current = null): array
    {
        $payload = [];
        $fields = [
            'service_code', 'service_group_id', 'name', 'description',
            'price', 'duration_minutes', 'commission_rate',
            'status', 'visibility', 'notes', 'image_path',
        ];
        foreach ($fields as $f) {
            if (array_key_exists($f, $data)) {
                $payload[$f] = $data[$f];
            }
        }

        if (isset($payload['service_code'])) {
            $payload['service_code'] = strtoupper(Str::slug($payload['service_code'], ''));
            if ($payload['service_code'] === '') {
                $payload['service_code'] = null;
            }
        }

        if (! $isUpdate) {
            if (empty($payload['service_code'])) {
                $payload['service_code'] = $this->generateNextCode();
            }
            $payload['status'] = $payload['status'] ?? Service::STATUS_DRAFT;
            $payload['visibility'] = $payload['visibility'] ?? Service::VISIBILITY_INTERNAL;
            $payload['commission_rate'] = $payload['commission_rate'] ?? 0;
            $payload['price'] = $payload['price'] ?? 0;
        }

        return $payload;
    }

    private function generateNextCode(): string
    {
        $max = 0;
        Service::query()
            ->where('service_code', 'like', 'DV%')
            ->pluck('service_code')
            ->each(function ($code) use (&$max) {
                if (preg_match('/^DV(\d+)$/', (string) $code, $m)) {
                    $n = (int) $m[1];
                    if ($n > $max) {
                        $max = $n;
                    }
                }
            });

        return 'DV'.str_pad((string) ($max + 1), 4, '0', STR_PAD_LEFT);
    }

    public function recentAuditLogs(int $limit = 30): Collection
    {
        return AuditLog::query()
            ->where(function ($q) {
                $q->where('action', 'like', 'service.%')
                    ->orWhere('action', 'like', 'service_attachment.%');
            })
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }
}
