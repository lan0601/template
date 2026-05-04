<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'start_datetime',
        'end_datetime',
        'status',
        'approved_by',
    ];

    // Relationship: Schedule belongs to a user (creator)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relationship: Schedule approved by admin user
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}