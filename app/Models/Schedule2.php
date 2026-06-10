<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Schedule2 extends Model
{
    use HasFactory;
    

    protected $fillable = [
        'classroom_id',
        'subject_id',
        'user_id',
        'title',
        'description',
        'start_date',
        'end_date',
        'day',
        'start_time',
        'end_time',
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