<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExternalAttendance extends Model
{
    protected $casts = [
        'attendance_date' => 'date',
        'cancelled_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    protected $fillable = [
        'user_id',
        'created_by',
        'cancelled_by',
        'campus_id',
        'employee_no',
        'subject_code',
        'class_room',
        'attendance_date',
        'time_in',
        'cancelled_at',
        'status',
        'is_active',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function canceller()
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }
}