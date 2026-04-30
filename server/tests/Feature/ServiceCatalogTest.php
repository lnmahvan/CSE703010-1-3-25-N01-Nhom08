<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Service;
use App\Models\ServiceGroup;
use App\Models\Specialty;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\ServiceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ServiceCatalogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        $this->seed(RoleSeeder::class);
        $this->seed(PermissionSeeder::class);
        $this->seed(ServiceSeeder::class);
    }

    public function test_admin_can_create_service_in_draft(): void
    {
        Sanctum::actingAs($this->createUser('admin'));
        $group = ServiceGroup::first();
        $spec = Specialty::first();

        $response = $this->postJson('/api/services', [
            'service_code' => 'DV9001',
            'service_group_id' => $group->id,
            'name' => 'Dich vu test moi',
            'price' => 0,
            'duration_minutes' => 30,
            'specialty_ids' => [$spec->id],
            'primary_specialty_id' => $spec->id,
            'visibility' => 'internal',
        ]);

        $response->assertCreated()
            ->assertJsonPath('service_code', 'DV9001')
            ->assertJsonPath('status', 'draft');

        $this->assertDatabaseHas('services', ['service_code' => 'DV9001']);
        $this->assertDatabaseHas('service_specialty', ['specialty_id' => $spec->id, 'is_primary' => true]);
    }

    public function test_e1_duplicate_service_code_rejected(): void
    {
        Sanctum::actingAs($this->createUser('admin'));

        $response = $this->postJson('/api/services', [
            'service_code' => 'DV0001',
            'name' => 'Khac ten cung ma',
            'service_group_id' => ServiceGroup::first()->id,
        ]);

        $response->assertStatus(422);
    }

    public function test_e2_duplicate_name_in_same_group_rejected(): void
    {
        Sanctum::actingAs($this->createUser('admin'));

        $existing = Service::first();
        $response = $this->postJson('/api/services', [
            'name' => $existing->name,
            'service_group_id' => $existing->service_group_id,
        ]);

        $response->assertStatus(422);
        $this->assertStringContainsString('E2', $response->json('message') ?? '');
    }

    public function test_e3_cannot_activate_without_price(): void
    {
        Sanctum::actingAs($this->createUser('admin'));
        $spec = Specialty::first();

        $response = $this->postJson('/api/services', [
            'service_code' => 'DV9100',
            'name' => 'Dich vu khong gia',
            'service_group_id' => ServiceGroup::first()->id,
            'price' => 0,
            'status' => 'active',
            'specialty_ids' => [$spec->id],
            'primary_specialty_id' => $spec->id,
        ]);

        $response->assertStatus(422);
    }

    public function test_e8_primary_must_be_within_required_specialties(): void
    {
        Sanctum::actingAs($this->createUser('admin'));
        $specs = Specialty::limit(2)->get();

        $response = $this->postJson('/api/services', [
            'service_code' => 'DV9101',
            'name' => 'Sai chuyen mon chinh',
            'service_group_id' => ServiceGroup::first()->id,
            'price' => 100000,
            'specialty_ids' => [$specs[0]->id],
            'primary_specialty_id' => $specs[1]->id,
        ]);

        $response->assertStatus(422);
        $this->assertStringContainsString('E8', $response->json('message') ?? '');
    }

    public function test_admin_can_change_status_and_history_recorded(): void
    {
        Sanctum::actingAs($this->createUser('admin'));
        $service = Service::where('status', 'active')->first();

        $response = $this->postJson('/api/services/'.$service->id.'/status', [
            'status' => 'hidden',
            'reason' => 'Tam an de cap nhat',
        ]);

        $response->assertOk()->assertJsonPath('status', 'hidden');
        $this->assertDatabaseHas('service_status_history', [
            'service_id' => $service->id,
            'new_status' => 'hidden',
        ]);
    }

    public function test_patient_only_sees_public_active_services(): void
    {
        Sanctum::actingAs($this->createUser('benh_nhan'));

        $response = $this->getJson('/api/services');

        $response->assertOk();
        $items = $response->json('data');
        $this->assertNotEmpty($items);
        foreach ($items as $svc) {
            $this->assertSame('active', $svc['status']);
            $this->assertSame('public', $svc['visibility']);
        }
    }

    public function test_filter_by_visibility_and_group(): void
    {
        Sanctum::actingAs($this->createUser('admin'));
        $group = ServiceGroup::where('code', 'GR_KHAM')->first();

        $response = $this->getJson('/api/services?service_group_id='.$group->id.'&visibility=public');
        $response->assertOk();

        foreach ($response->json('data') as $svc) {
            $this->assertSame($group->id, $svc['service_group_id']);
            $this->assertSame('public', $svc['visibility']);
        }
    }

    public function test_e7_attachment_size_validation(): void
    {
        Sanctum::actingAs($this->createUser('admin'));
        $service = Service::first();

        $tooBig = UploadedFile::fake()->image('big.png')->size(6 * 1024); // 6 MB
        $response = $this->post('/api/services/'.$service->id.'/attachments', [
            'file' => $tooBig,
            'attachment_type' => 'image',
            'visibility' => 'public',
        ]);

        $response->assertStatus(422);
    }

    private function createUser(string $roleSlug): User
    {
        $user = User::factory()->create([
            'name' => $roleSlug.' user',
            'email' => $roleSlug.'-svc@example.com',
            'username' => $roleSlug.'_svc',
            'password' => Hash::make('Password@123'),
        ]);
        $user->roles()->attach(Role::where('slug', $roleSlug)->firstOrFail()->id);

        return $user;
    }
}
