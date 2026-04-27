<?php

namespace App\Services;

use App\Models\ProfessionalProfile;

class ProfessionalProfileUsageChecker
{
    public function isInUse(ProfessionalProfile $profile): bool
    {
        return false;
    }
}
