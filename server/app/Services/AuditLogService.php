<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;

class AuditLogService
{
    public function log(?User $actor, string $action, array $details = []): void
    {
        AuditLog::create([
            'admin_id' => $actor?->id ?? 0,
            'admin_name' => $actor?->name ?? 'System',
            'action' => $action,
            'details' => json_encode($details, JSON_UNESCAPED_UNICODE),
        ]);
    }
}
