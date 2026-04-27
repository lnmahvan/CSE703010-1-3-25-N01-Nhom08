<?php

namespace Database\Seeders;

use App\Models\ProfessionalProfile;
use App\Models\Service;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProfessionalProfileSeeder extends Seeder
{
    public function run(): void
    {
        $doctor = Staff::where('employee_code', 'BS001')->first();
        $accountant = Staff::where('employee_code', 'KT001')->first();
        $admin = User::where('email', 'admin@dental.com')->first();

        if (! $doctor || ! $accountant) {
            return;
        }

        $serviceIds = Service::query()->orderBy('id')->pluck('id')->values();

        $doctorProfile = ProfessionalProfile::updateOrCreate(
            [
                'staff_id' => $doctor->id,
                'profile_role' => 'bac_si',
            ],
            [
                'status' => ProfessionalProfile::STATUS_APPROVED,
                'notes' => 'Ho so mau da duyet cho bac si.',
                'submitted_at' => now()->subDays(12),
                'approved_at' => now()->subDays(10),
                'approved_by' => $admin?->id,
                'is_active' => true,
            ]
        );

        $ortho = $doctorProfile->specialties()->updateOrCreate(
            ['specialty_name' => 'Chinh nha'],
            [
                'degree' => 'Thac si',
                'years_experience' => 7,
                'service_scope' => $serviceIds->take(2)->all(),
                'branch_or_room' => 'Chi nhanh Quan 1 - Phong 201',
                'notes' => 'Phu trach dieu tri chinh nha va nhổ rang kho.',
            ]
        );

        $general = $doctorProfile->specialties()->updateOrCreate(
            ['specialty_name' => 'Rang ham mat tong quat'],
            [
                'degree' => 'Bac si',
                'years_experience' => 10,
                'service_scope' => $serviceIds->all(),
                'branch_or_room' => 'Chi nhanh Quan 3 - Phong 102',
                'notes' => 'Dam nhan kham tong quat va danh gia dieu tri.',
            ]
        );

        $doctorProfile->certificates()->updateOrCreate(
            ['certificate_number' => 'BS-CC-001'],
            [
                'professional_profile_specialty_id' => $general->id,
                'certificate_type' => 'Chung chi hanh nghe',
                'certificate_name' => 'Chung chi hanh nghe kham chua benh',
                'issued_date' => now()->subYears(4)->toDateString(),
                'expiry_date' => now()->addYears(1)->toDateString(),
                'issuer' => 'So Y te TP.HCM',
                'scope_label' => 'Kham nha tong quat',
                'notes' => 'Tai lieu chinh de xep lich kham.',
                'file_path' => 'seed/professional-profiles/doctor-license.pdf',
                'file_name' => 'doctor-license.pdf',
                'file_mime' => 'application/pdf',
                'file_size' => 245760,
                'is_primary' => true,
            ]
        );

        $doctorProfile->certificates()->updateOrCreate(
            ['certificate_number' => 'BS-CK-002'],
            [
                'professional_profile_specialty_id' => $ortho->id,
                'certificate_type' => 'Chung chi chuyen khoa',
                'certificate_name' => 'Chung chi chinh nha nang cao',
                'issued_date' => now()->subYears(2)->toDateString(),
                'expiry_date' => now()->addDays(20)->toDateString(),
                'issuer' => 'Benh vien Rang Ham Mat Trung uong',
                'scope_label' => 'Nieng rang va dieu tri chinh nha',
                'notes' => 'Mau canh bao sap het han.',
                'file_path' => 'seed/professional-profiles/doctor-ortho.jpg',
                'file_name' => 'doctor-ortho.jpg',
                'file_mime' => 'image/jpeg',
                'file_size' => 198452,
                'is_primary' => false,
            ]
        );

        $accountantProfile = ProfessionalProfile::updateOrCreate(
            [
                'staff_id' => $accountant->id,
                'profile_role' => 'ke_toan',
            ],
            [
                'status' => ProfessionalProfile::STATUS_PENDING,
                'notes' => 'Ho so mau dang cho duyet cua ke toan.',
                'submitted_at' => now()->subDays(2),
                'approved_at' => null,
                'approved_by' => null,
                'is_active' => true,
            ]
        );

        $accountantProfile->certificates()->updateOrCreate(
            ['certificate_number' => 'KT-CC-001'],
            [
                'professional_profile_specialty_id' => null,
                'certificate_type' => 'Chung chi ke toan',
                'certificate_name' => 'Chung chi ke toan tong hop',
                'issued_date' => now()->subYears(3)->toDateString(),
                'expiry_date' => now()->addMonths(18)->toDateString(),
                'issuer' => 'Hoi Ke toan Viet Nam',
                'scope_label' => 'Thu chi, doi soat va bao cao doanh thu',
                'notes' => 'Ho so cho admin duyet.',
                'file_path' => 'seed/professional-profiles/accountant-cert.png',
                'file_name' => 'accountant-cert.png',
                'file_mime' => 'image/png',
                'file_size' => 163840,
                'is_primary' => true,
            ]
        );

        $accountantProfile->certificates()->updateOrCreate(
            ['certificate_number' => 'KT-BC-002'],
            [
                'professional_profile_specialty_id' => null,
                'certificate_type' => 'Bang cap',
                'certificate_name' => 'Bang cu nhan ke toan',
                'issued_date' => now()->subYears(6)->toDateString(),
                'expiry_date' => null,
                'issuer' => 'Dai hoc Kinh te TP.HCM',
                'scope_label' => 'Ke toan noi bo',
                'notes' => 'Tai lieu bo sung.',
                'file_path' => 'seed/professional-profiles/accountant-degree.pdf',
                'file_name' => 'accountant-degree.pdf',
                'file_mime' => 'application/pdf',
                'file_size' => 184320,
                'is_primary' => false,
            ]
        );
    }
}
