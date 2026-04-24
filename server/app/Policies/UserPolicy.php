<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $this->isAdmin($user);
    }

    public function create(User $user): bool
    {
        return $this->isAdmin($user);
    }

    public function update(User $user, User $targetUser): bool
    {
        return $this->isAdmin($user);
    }

    public function toggleStatus(User $user, User $targetUser): bool
    {
        return $this->isAdmin($user);
    }

    public function resetPassword(User $user, User $targetUser): bool
    {
        return $this->isAdmin($user);
    }

    private function isAdmin(User $user): bool
    {
        return $user->roles()->where('slug', 'admin')->exists();
    }
}
