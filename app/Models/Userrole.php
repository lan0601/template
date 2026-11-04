<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Userrole extends Model
{
    use HasFactory;

    public const MODULES = [
        'dashboard' => 'Dashboard',
        'users' => 'Users',
        'user_roles' => 'User Roles',
    ];

    protected $table = 'user_roles';

    protected $fillable = ['role_name', 'permissions'];

    protected static function booted(): void
    {
        static::saving(function (self $role) {
            $role->role_name = strtolower(trim($role->role_name));
            $role->permissions = array_intersect_key(
                $role->permissions ?? [],
                array_fill_keys(array_keys(self::MODULES), true)
            );
        });
    }

    protected function casts(): array
    {
        return ['permissions' => 'array'];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'userroleid');
    }
}
