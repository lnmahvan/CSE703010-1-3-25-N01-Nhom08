<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;

class DashboardController extends Controller
{
    public function getAdminStats()
    {
        $totalUsers = User::count();

        // TODO: Replace with Appointment and Invoice queries when those tables exist.
        $appointmentsToday = 0;
        $expectedRevenue = 0;

        return response()->json([
            'total_users' => $totalUsers,
            'appointments_today' => $appointmentsToday,
            'expected_revenue' => $expectedRevenue,
        ]);
    }
}
