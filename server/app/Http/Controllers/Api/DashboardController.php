<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function getAdminStats(Request $request)
    {
        if (! $this->isAdmin($request->user())) {
            return response()->json(['message' => 'Khong co quyen truy cap'], 403);
        }

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

    private function isAdmin(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return $user->roles()->where('slug', 'admin')->exists();
    }
}
