<?php

namespace App\Console\Commands;

use App\Services\ProfessionalProfileService;
use Illuminate\Console\Command;

class ExpireProfessionalProfiles extends Command
{
    protected $signature = 'professional-profiles:expire';

    protected $description = 'Mark professional profiles as expired when any certificate is expired';

    public function handle(ProfessionalProfileService $professionalProfileService): int
    {
        $count = $professionalProfileService->expireProfiles();
        $this->info("Expired {$count} professional profiles.");

        return self::SUCCESS;
    }
}
