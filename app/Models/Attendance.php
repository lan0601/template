<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'user_id',
        'campus_id',
        'subject_id',
        'subject_code',
        'classroom_id',
        'attendance_date',
        'time_in',
        'status',
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function classroom()
    {
        return $this->belongsTo(Classroom::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
