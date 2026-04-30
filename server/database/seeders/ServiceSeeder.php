<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\ServiceGroup;
use App\Models\ServicePriceHistory;
use App\Models\ServiceStatusHistory;
use App\Models\Specialty;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Seed dich vu nha khoa voi du lieu relational:
     * service_groups, specialties, services, service_specialty,
     * service_price_history, service_status_history
     */
    public function run(): void
    {
        // ── 1. Nhom dich vu (Service Groups) ──
        $groups = [
            ['code' => 'PHONG_NGUA', 'name' => 'Phòng ngừa & Vệ sinh', 'slug' => 'phong-ngua-ve-sinh', 'display_order' => 1],
            ['code' => 'DIEU_TRI',   'name' => 'Điều trị nha khoa',    'slug' => 'dieu-tri-nha-khoa',   'display_order' => 2],
            ['code' => 'THAM_MY',    'name' => 'Thẩm mỹ nha khoa',     'slug' => 'tham-my-nha-khoa',    'display_order' => 3],
            ['code' => 'PHAU_THUAT', 'name' => 'Phẫu thuật',           'slug' => 'phau-thuat',          'display_order' => 4],
            ['code' => 'CHINH_NHA',  'name' => 'Chỉnh nha',            'slug' => 'chinh-nha',           'display_order' => 5],
        ];

        $groupMap = [];
        foreach ($groups as $g) {
            $groupMap[$g['code']] = ServiceGroup::firstOrCreate(
                ['code' => $g['code']],
                $g
            );
        }

        // ── 2. Chuyen khoa (Specialties) ──
        $specialties = [
            ['code' => 'RANG_HAM_MAT',   'name' => 'Răng Hàm Mặt'],
            ['code' => 'NHA_CHU',         'name' => 'Nha chu'],
            ['code' => 'NOI_NHA',         'name' => 'Nội nha'],
            ['code' => 'PHUC_HINH',       'name' => 'Phục hình răng'],
            ['code' => 'CHINH_NHA_CK',    'name' => 'Chỉnh nha'],
            ['code' => 'THAM_MY_CK',      'name' => 'Thẩm mỹ nha khoa'],
            ['code' => 'PHAU_THUAT_MIENG','name' => 'Phẫu thuật miệng'],
        ];

        $specMap = [];
        foreach ($specialties as $s) {
            $specMap[$s['code']] = Specialty::firstOrCreate(
                ['code' => $s['code']],
                $s
            );
        }

        // ── 3. Dich vu (Services) ──
        $services = [
            // Phong ngua & Ve sinh
            [
                'service_code' => 'DV-001', 'group' => 'PHONG_NGUA',
                'name' => 'Lấy cao răng', 'price' => 200000, 'commission_rate' => 10,
                'duration_minutes' => 30, 'status' => 'active', 'visibility' => 'public',
                'description' => 'Lấy cao răng siêu âm, đánh bóng bề mặt răng.',
                'specialties' => ['NHA_CHU' => true],
            ],
            [
                'service_code' => 'DV-002', 'group' => 'PHONG_NGUA',
                'name' => 'Tẩy trắng răng', 'price' => 2500000, 'commission_rate' => 20,
                'duration_minutes' => 60, 'status' => 'active', 'visibility' => 'public',
                'description' => 'Tẩy trắng răng bằng đèn laser chuyên dụng.',
                'specialties' => ['THAM_MY_CK' => true],
            ],

            // Dieu tri nha khoa
            [
                'service_code' => 'DV-003', 'group' => 'DIEU_TRI',
                'name' => 'Trám răng Composite', 'price' => 350000, 'commission_rate' => 12,
                'duration_minutes' => 45, 'status' => 'active', 'visibility' => 'public',
                'description' => 'Trám răng bằng vật liệu Composite thẩm mỹ.',
                'specialties' => ['NOI_NHA' => true, 'RANG_HAM_MAT' => false],
            ],
            [
                'service_code' => 'DV-004', 'group' => 'DIEU_TRI',
                'name' => 'Điều trị tủy', 'price' => 1200000, 'commission_rate' => 15,
                'duration_minutes' => 90, 'status' => 'active', 'visibility' => 'public',
                'description' => 'Điều trị viêm tủy, lấy tủy hoàn toàn.',
                'specialties' => ['NOI_NHA' => true],
            ],

            // Phau thuat
            [
                'service_code' => 'DV-005', 'group' => 'PHAU_THUAT',
                'name' => 'Nhổ răng khôn', 'price' => 1500000, 'commission_rate' => 15,
                'duration_minutes' => 60, 'status' => 'active', 'visibility' => 'public',
                'description' => 'Nhổ răng khôn (răng số 8) bằng phẫu thuật.',
                'specialties' => ['PHAU_THUAT_MIENG' => true, 'RANG_HAM_MAT' => false],
            ],
            [
                'service_code' => 'DV-006', 'group' => 'PHAU_THUAT',
                'name' => 'Cấy ghép Implant', 'price' => 15000000, 'commission_rate' => 18,
                'duration_minutes' => 120, 'status' => 'active', 'visibility' => 'public',
                'description' => 'Cấy ghép trụ Implant Titanium thay thế răng mất.',
                'specialties' => ['PHAU_THUAT_MIENG' => true, 'PHUC_HINH' => false],
            ],

            // Tham my nha khoa
            [
                'service_code' => 'DV-007', 'group' => 'THAM_MY',
                'name' => 'Dán sứ Veneer', 'price' => 5000000, 'commission_rate' => 20,
                'duration_minutes' => 60, 'status' => 'active', 'visibility' => 'public',
                'description' => 'Dán mặt sứ Veneer siêu mỏng cải thiện thẩm mỹ.',
                'specialties' => ['THAM_MY_CK' => true, 'PHUC_HINH' => false],
            ],
            [
                'service_code' => 'DV-008', 'group' => 'THAM_MY',
                'name' => 'Bọc răng sứ thẩm mỹ', 'price' => 3500000, 'commission_rate' => 18,
                'duration_minutes' => 90, 'status' => 'draft', 'visibility' => 'internal',
                'description' => 'Bọc mão sứ toàn phần, phục hình thẩm mỹ.',
                'specialties' => ['PHUC_HINH' => true, 'THAM_MY_CK' => false],
            ],

            // Chinh nha
            [
                'service_code' => 'DV-009', 'group' => 'CHINH_NHA',
                'name' => 'Niềng răng mắc cài kim loại', 'price' => 25000000, 'commission_rate' => 15,
                'duration_minutes' => 60, 'status' => 'active', 'visibility' => 'public',
                'description' => 'Chỉnh nha bằng mắc cài kim loại truyền thống.',
                'specialties' => ['CHINH_NHA_CK' => true],
            ],
            [
                'service_code' => 'DV-010', 'group' => 'CHINH_NHA',
                'name' => 'Niềng răng trong suốt Invisalign', 'price' => 60000000, 'commission_rate' => 20,
                'duration_minutes' => 45, 'status' => 'active', 'visibility' => 'public',
                'description' => 'Chỉnh nha bằng khay trong suốt Invisalign.',
                'specialties' => ['CHINH_NHA_CK' => true, 'THAM_MY_CK' => false],
            ],
        ];

        foreach ($services as $sData) {
            $groupCode = $sData['group'];
            $specialtiesMap = $sData['specialties'];
            unset($sData['group'], $sData['specialties']);

            $sData['service_group_id'] = $groupMap[$groupCode]->id;

            $service = Service::firstOrCreate(
                ['service_code' => $sData['service_code']],
                $sData
            );

            // Gan chuyen khoa cho dich vu
            $pivotData = [];
            foreach ($specialtiesMap as $specCode => $isPrimary) {
                if (isset($specMap[$specCode])) {
                    $pivotData[$specMap[$specCode]->id] = ['is_primary' => $isPrimary];
                }
            }
            $service->specialties()->syncWithoutDetaching($pivotData);

            // Lich su gia ban dau
            ServicePriceHistory::firstOrCreate(
                ['service_id' => $service->id, 'new_price' => $service->price],
                [
                    'old_price' => null,
                    'reason' => 'Gia khoi tao',
                    'effective_date' => now()->toDateString(),
                ]
            );

            // Lich su trang thai ban dau
            ServiceStatusHistory::firstOrCreate(
                ['service_id' => $service->id, 'new_status' => $service->status],
                [
                    'old_status' => null,
                    'reason' => 'Khoi tao dich vu',
                ]
            );
        }
    }
}
