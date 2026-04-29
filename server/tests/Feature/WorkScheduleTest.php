<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\ProfessionalProfile;
use App\Models\Role;
use App\Models\Staff;
use App\Models\User;
use App\Models\WorkSchedule;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\WorkShiftTemplateSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WorkScheduleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
        $this->seed(PermissionSeeder::class);
        $this->seed(WorkShiftTemplateSeeder::class);
    }

    public function test_admin_can_create_schedule_for_doctor_with_approved_profile(): void
    {
        $admin = $this->createAdmin();
        $branch = Branch::create(['code' => 'BR1', 'name' => 'CN1', 'status' => 'active']);
        $doctor = $this->createStaff('bac_si', 'BS01', 'Doctor One', $branch->id);
        $this->createApprovedProfile($doctor);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/work-schedules', [
            'staff_id' => $doctor->id,
            'branch_id' => $branch->id,
            'work_date' => now()->addDay()->toDateString(),
            'start_time' => '07:00',
            'end_time' => '11:00',
            'work_role' => 'doctor_treatment',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('work_schedules', [
            'staff_id' => $doctor->id,
            'work_role' => 'doctor_treatment',
        ]);
    }

    public function test_e1_overlap_is_rejected(): void
    {
        $admin = $this->createAdmin();
        $staff = $this->createStaff('le_tan', 'LT01');
        Sanctum::actingAs($admin);

        $date = now()->addDay()->toDateString();
        $base = [
            'staff_id' => $staff->id,
            'work_date' => $date,
            'work_role' => 'reception',
            'start_time' => '08:00',
            'end_time' => '12:00',
        ];
        $this->postJson('/api/work-schedules', $base)->assertCreated();

        $this->postJson('/api/work-schedules', array_merge($base, [
            'start_time' => '11:00',
            'end_time' => '13:00',
        ]))->assertStatus(422);
    }

    public function test_e2_suspended_staff_cannot_be_scheduled(): void
    {
        $admin = $this->createAdmin();
        $staff = $this->createStaff('le_tan', 'LT02');
        $staff->update(['status' => 'suspended']);

        Sanctum::actingAs($admin);

        $this->postJson('/api/work-schedules', [
            'staff_id' => $staff->id,
            'work_date' => now()->addDay()->toDateString(),
            'start_time' => '08:00',
            'end_time' => '12:00',
            'work_role' => 'reception',
        ])->assertStatus(422);
    }

    public function test_e3_doctor_without_approved_profile_is_rejected(): void
    {
        $admin = $this->createAdmin();
        $doctor = $this->createStaff('bac_si', 'BS02');

        Sanctum::actingAs($admin);

        $this->postJson('/api/work-schedules', [
            'staff_id' => $doctor->id,
            'work_date' => now()->addDay()->toDateString(),
            'start_time' => '07:00',
            'end_time' => '11:00',
            'work_role' => 'doctor_treatment',
        ])->assertStatus(422);
    }

    public function test_e5_max_hours_per_day_is_enforced(): void
    {
        $admin = $this->createAdmin();
        $staff = $this->createStaff('le_tan', 'LT03');
        Sanctum::actingAs($admin);

        $date = now()->addDay()->toDateString();
        $this->postJson('/api/work-schedules', [
            'staff_id' => $staff->id,
            'work_date' => $date,
            'start_time' => '06:00',
            'end_time' => '14:00',
            'work_role' => 'reception',
        ])->assertCreated();

        // Adding 5 more hours would exceed 12h/day cap.
        $this->postJson('/api/work-schedules', [
            'staff_id' => $staff->id,
            'work_date' => $date,
            'start_time' => '15:00',
            'end_time' => '20:00',
            'work_role' => 'reception',
        ])->assertStatus(422);
    }

    public function test_e10_reject_leave_without_reason_is_blocked(): void
    {
        $admin = $this->createAdmin();
        $staff = $this->createStaff('le_tan', 'LT04');
        Sanctum::actingAs($admin);

        $createRes = $this->postJson('/api/work-schedules', [
            'staff_id' => $staff->id,
            'work_date' => now()->addDays(2)->toDateString(),
            'start_time' => '08:00',
            'end_time' => '12:00',
            'work_role' => 'reception',
        ])->assertCreated();
        $scheduleId = $createRes->json('id');

        // Submit a leave request as the staff user
        Sanctum::actingAs($staff->user);
        $leaveRes = $this->postJson('/api/leave-requests', [
            'work_schedule_id' => $scheduleId,
            'reason' => 'Sick leave',
        ])->assertCreated();
        $leaveId = $leaveRes->json('id');

        // Reject without note should be 422
        Sanctum::actingAs($admin);
        $this->postJson("/api/leave-requests/{$leaveId}/reject", [])->assertStatus(422);

        // With a note should succeed
        $this->postJson("/api/leave-requests/{$leaveId}/reject", [
            'review_note' => 'Khong du ly do',
        ])->assertOk();
    }

    public function test_copy_week_skips_invalid_and_creates_others(): void
    {
        $admin = $this->createAdmin();
        $staff = $this->createStaff('le_tan', 'LT05');
        Sanctum::actingAs($admin);

        $sourceMon = now()->startOfWeek()->toDateString();
        $destMon = now()->addWeek()->startOfWeek()->toDateString();

        $this->postJson('/api/work-schedules', [
            'staff_id' => $staff->id,
            'work_date' => $sourceMon,
            'start_time' => '08:00',
            'end_time' => '12:00',
            'work_role' => 'reception',
        ])->assertCreated();

        $res = $this->postJson('/api/work-schedules/copy', [
            'source_from' => $sourceMon,
            'dest_from' => $destMon,
            'skip_conflicts' => true,
        ])->assertOk();

        $this->assertGreaterThanOrEqual(1, $res->json('created'));
        $this->assertDatabaseHas('work_schedules', [
            'staff_id' => $staff->id,
            'work_date' => $destMon,
        ]);
    }

    private function createAdmin(): User
    {
        $user = User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin-ws@example.com',
            'username' => 'admin_ws',
            'password' => Hash::make('Password@123'),
        ]);
        $user->roles()->attach(Role::where('slug', 'admin')->firstOrFail()->id);

        return $user;
    }

    private function createStaff(string $roleSlug, string $code, string $name = 'Staff Test', ?int $branchId = null): Staff
    {
        $user = User::factory()->create([
            'name' => $name,
            'email' => "{$code}@example.com",
            'username' => strtolower($code),
            'password' => Hash::make('Password@123'),
        ]);
        $user->roles()->attach(Role::where('slug', $roleSlug)->firstOrFail()->id);

        return Staff::create([
            'employee_code' => $code,
            'full_name' => $name,
            'email' => $user->email,
            'role_slug' => $roleSlug,
            'status' => 'working',
            'user_id' => $user->id,
            'branch_id' => $branchId,
        ]);
    }

    private function createApprovedProfile(Staff $staff): ProfessionalProfile
    {
        return ProfessionalProfile::create([
            'staff_id' => $staff->id,
            'profile_role' => 'bac_si',
            'status' => 'approved',
            'is_active' => true,
            'approved_at' => now(),
        ]);
    }
}
