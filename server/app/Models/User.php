<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'status',
        'phone',
        'username',
        'employee_id',
        'avatar',
        'linked_profile_id',
        'google_id',

    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    public function hasRole(string $roleSlug): bool
    {
        if ($this->relationLoaded('roles')) {
            return $this->roles->contains('slug', $roleSlug);
        }

        return $this->roles()->where('slug', $roleSlug)->exists();
    }

    public function permissions()
    {
        return $this->belongsToMany(Permission::class);
    }

    public function staff()
    {
        return $this->hasOne(Staff::class);
    }

    public function hasPermissionTo(string $permissionSlug): bool
    {
        // Theo luật: Khi có quyền riêng, quyền tài khoản được ưu tiên hơn quyền vai trò (ghi đè hoàn toàn).
        // Nếu user có thiết lập quyền riêng trong permission_user (dù là rỗng), ta sẽ chỉ check trong đó.
        // Tuy nhiên, để xác định "user có thiết lập quyền riêng hay không", ta cần kiểm tra xem họ có record nào trong permission_user không.
        // Nhưng nếu họ bị gỡ hết quyền riêng thì sao? 
        // Trong cách thiết kế chuẩn: Nếu admin cấu hình "Quyền riêng", admin sẽ check trực tiếp vào tài khoản đó.
        // Vì vậy quyền thực sự của User = tất cả quyền riêng (nếu có bất kỳ quyền riêng nào được cấp) 
        // HOẶC dùng 1 cờ riêng. Nhưng ở đây ta thống nhất: Quyền cuối cùng = Quyền Riêng (nếu count > 0) else Quyền Role.
        // Để linh hoạt và đúng đắn nhất với hệ thống ghi đè:
        // Ta nên check quyền riêng trước.
        
        $hasCustomPermissions = $this->permissions()->count() > 0;

        if ($hasCustomPermissions) {
            return $this->permissions()->where('slug', $permissionSlug)->exists();
        }

        // Nếu không có quyền riêng, check quyền qua roles
        foreach ($this->roles as $role) {
            if ($role->permissions()->where('slug', $permissionSlug)->exists()) {
                return true;
            }
        }

        return false;
    }

    public function getPermissionSlugs(): array
    {
        $this->loadMissing(['roles.permissions', 'permissions']);

        if ($this->permissions->count() > 0) {
            return $this->permissions->pluck('slug')->toArray();
        }

        $permissionSlugs = [];
        foreach ($this->roles as $role) {
            $permissionSlugs = array_merge($permissionSlugs, $role->permissions->pluck('slug')->toArray());
        }

        return array_values(array_unique($permissionSlugs));
    }
}
