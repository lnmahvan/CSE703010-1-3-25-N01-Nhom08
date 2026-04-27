<?php

namespace Tests\Feature;

use App\Models\ProfessionalProfile;
use App\Models\Role;
use App\Models\Staff;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfessionalProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');
        $this->seed(RoleSeeder::class);
        $this->seed(PermissionSeeder::class);
    }

    public function test_admin_can_create_doctor_professional_profile(): void
    {
        $admin = $this->createAdmin();
        $staff = $this->createStaff('bac_si');

        Sanctum::actingAs($admin);

        $response = $this->post('/api/professional-profiles', [
            'staff_id' => $staff->id,
            'profile_role' => 'bac_si',
            'status' => 'pending',
            'notes' => 'Ho so tao moi',
            'specialties_payload' => json_encode([
                [
                    'client_key' => 'sp_1',
                    'specialty_name' => 'Rang ham mat',
                    'degree' => 'Thac si',
                    'years_experience' => 8,
                    'service_scope' => [1, 2],
                    'branch_or_room' => 'Co so A',
                    'notes' => 'Chuyen mon chinh',
                ],
            ]),
            'certificates_payload' => json_encode([
                [
                    'certificate_type' => 'Chung chi hanh nghe',
                    'certificate_name' => 'CC HN',
                    'certificate_number' => 'BS-001',
                    'issued_date' => now()->subYear()->toDateString(),
                    'expiry_date' => now()->addYear()->toDateString(),
                    'issuer' => 'So Y te',
                    'scope_label' => 'Nho rang',
                    'specialty_client_key' => 'sp_1',
                    'is_primary' => true,
                ],
            ]),
            'certificate_files' => [
                UploadedFile::fake()->create('cc.pdf', 100, 'application/pdf'),
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('profile.profile_role', 'bac_si')
            ->assertJsonPath('profile.status', 'pending');

        $this->assertDatabaseHas('professional_profiles', [
            'staff_id' => $staff->id,
            'profile_role' => 'bac_si',
        ]);
        $this->assertDatabaseHas('professional_profile_specialties', [
            'specialty_name' => 'Rang ham mat',
        ]);
        $this->assertDatabaseHas('professional_profile_certificates', [
            'certificate_number' => 'BS-001',
        ]);
    }

    public function test_duplicate_certificate_number_is_rejected(): void
    {
        $admin = $this->createAdmin();
        $staffA = $this->createStaff('bac_si', 'BSA001', 'Doctor A');
        $staffB = $this->createStaff('bac_si', 'BSB001', 'Doctor B');

        Sanctum::actingAs($admin);

        $payload = [
            'profile_role' => 'bac_si',
            'status' => 'pending',
            'specialties_payload' => json_encode([
                ['client_key' => 'sp_1', 'specialty_name' => 'Noi nha'],
            ]),
            'certificates_payload' => json_encode([
                [
                    'certificate_type' => 'Chung chi hanh nghe',
                    'certificate_name' => 'CC',
                    'certificate_number' => 'DUP-01',
                    'expiry_date' => now()->addMonth()->toDateString(),
                    'specialty_client_key' => 'sp_1',
                ],
            ]),
            'certificate_files' => [
                UploadedFile::fake()->create('cc.pdf', 100, 'application/pdf'),
            ],
        ];

        $this->post('/api/professional-profiles', array_merge($payload, ['staff_id' => $staffA->id]))->assertCreated();
        $this->post('/api/professional-profiles', array_merge($payload, ['staff_id' => $staffB->id]))->assertStatus(422);
    }

    public function test_self_service_cannot_modify_forbidden_fields(): void
    {
        $staffUser = User::factory()->create([
            'name' => 'Doctor Self',
            'email' => 'doctor-self@example.com',
            'username' => 'doctor_self',
            'password' => Hash::make('Password@123'),
        ]);
        $staffUser->roles()->attach(Role::where('slug', 'bac_si')->firstOrFail()->id);
        $staff = Staff::create([
            'employee_code' => 'BSSELF01',
            'full_name' => 'Doctor Self',
            'email' => 'doctor-self@example.com',
            'role_slug' => 'bac_si',
            'status' => 'working',
            'user_id' => $staffUser->id,
        ]);
        $profile = ProfessionalProfile::create([
            'staff_id' => $staff->id,
            'profile_role' => 'bac_si',
            'status' => 'draft',
            'is_active' => true,
        ]);

        Sanctum::actingAs($staffUser);

        $this->put("/api/my-professional-profile/{$profile->id}", [
            'status' => 'approved',
            'specialties_payload' => json_encode([]),
            'certificates_payload' => json_encode([]),
        ])->assertStatus(422);
    }

    public function test_admin_cannot_approve_profile_with_expired_certificate(): void
    {
        $admin = $this->createAdmin();
        $profile = $this->createProfileWithCertificate(now()->subDay()->toDateString());

        Sanctum::actingAs($admin);

        $this->post("/api/professional-profiles/{$profile->id}/approve")->assertStatus(422);
    }

    public function test_expire_command_marks_pending_or_approved_profiles_as_expired(): void
    {
        $profile = $this->createProfileWithCertificate(now()->subDay()->toDateString());
        $profile->update(['status' => 'approved']);

        Artisan::call('professional-profiles:expire');

        $this->assertDatabaseHas('professional_profiles', [
            'id' => $profile->id,
            'status' => 'expired',
            'is_active' => 0,
        ]);
    }

    private function createAdmin(): User
    {
        $admin = User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin-test@example.com',
            'username' => 'admin_test',
            'password' => Hash::make('Password@123'),
        ]);
        $admin->roles()->attach(Role::where('slug', 'admin')->firstOrFail()->id);

        return $admin;
    }

    private function createStaff(string $roleSlug, string $employeeCode = 'BS001', string $name = 'Doctor Test'): Staff
    {
        $user = User::factory()->create([
            'name' => $name,
            'email' => strtolower(str_replace(' ', '.', $name)) . '@example.com',
            'username' => strtolower(str_replace(' ', '_', $name)),
            'password' => Hash::make('Password@123'),
        ]);
        $user->roles()->attach(Role::where('slug', $roleSlug)->firstOrFail()->id);

        return Staff::create([
            'employee_code' => $employeeCode,
            'full_name' => $name,
            'email' => $user->email,
            'role_slug' => $roleSlug,
            'status' => 'working',
            'user_id' => $user->id,
        ]);
    }

    private function createProfileWithCertificate(string $expiryDate): ProfessionalProfile
    {
        $staff = $this->createStaff('bac_si', 'BSCMD01', 'Doctor Command');
        $profile = ProfessionalProfile::create([
            'staff_id' => $staff->id,
            'profile_role' => 'bac_si',
            'status' => 'pending',
            'is_active' => true,
        ]);

        $specialty = $profile->specialties()->create([
            'specialty_name' => 'Ngoai nha',
            'years_experience' => 4,
        ]);

        $profile->certificates()->create([
            'professional_profile_specialty_id' => $specialty->id,
            'certificate_type' => 'Chung chi hanh nghe',
            'certificate_name' => 'CC',
            'certificate_number' => 'CMD-001-' . md5($expiryDate),
            'issued_date' => now()->subYear()->toDateString(),
            'expiry_date' => $expiryDate,
            'file_path' => 'private/professional-profiles/test.pdf',
            'file_name' => 'test.pdf',
            'file_mime' => 'application/pdf',
            'file_size' => 1000,
        ]);

        return $profile;
    }
}
