<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Enroll;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'lname',
        'email',
        'phone',
        'campusID',
        'password',
        'userroleid',
        'remove',
        'permissions',
    ];

    public function userRole(): BelongsTo
    {
        return $this->belongsTo(Userrole::class, 'userroleid');
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'permissions' => 'array',
            'remove' => 'boolean',
        ];
    }

    protected $appends = ['role'];

    public function getRoleAttribute(): ?string
    {
        return $this->userRole?->role_name;
    }
}
