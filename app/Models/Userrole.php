<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Userrole extends Model
{
    protected $table = 'user_roles';

    protected $fillable = [
        'role_name',
        'permissions',
    ];

    protected $casts = [
        'permissions' => 'array',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'userroleid');
    }
}
