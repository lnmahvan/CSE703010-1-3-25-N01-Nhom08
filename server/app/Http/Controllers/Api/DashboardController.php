<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
// use App\Models\Appointment; // Chờ bảng lịch hẹn
// use App\Models\Invoice; // Chờ bảng hóa đơn

class DashboardController extends Controller
{
    public function getAdminStats(Request $request)
    {
        // Kiểm tra quyền Admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        // 1. Đếm tổng số người dùng (Bao gồm nhân sự và bệnh nhân)
        $totalUsers = User::count();

        // 2. Đếm lịch hẹn hôm nay (Lấy dữ liệu thật khi có bảng Appointment)
        // $appointmentsToday = Appointment::whereDate('appointment_date', now())->count();
        $appointmentsToday = 0; 

        // 3. Tính doanh thu hôm nay (Lấy dữ liệu thật khi có bảng Invoice)
        // $expectedRevenue = Invoice::whereDate('created_at', now())->sum('total_amount');
        $expectedRevenue = 0;

        return response()->json([
            'total_users' => $totalUsers,
            'appointments_today' => $appointmentsToday,
            'expected_revenue' => $expectedRevenue
        ]);
    }
}