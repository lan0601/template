<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubjectOffering extends Model
{
    protected $fillable = [
        'subject_id',
        'teacher_id',
        'classroom_id',
        'section',
        'term',
        'school_year',
        'semester',
        'day',
        'start_time',
        'end_time',
        'capacity',
        'status',
        'remove',
    ];

    public function subject()
    {
        $subject = $this->belongsTo(Subject::class,'subject_id');
        return $subject;
    }

    public function teacher()
    {
        $teacher = $this->belongsTo(User::class, 'teacher_id');
        return $teacher;
    }

    public function classroom()
    {
        $classroom = $this->belongsTo(Classroom::class,'classroom_id');
        return $classroom;
    }

    public function enrollments()
    {
        return $this->hasMany(EnrollmentSubject::class, 'subject_offering_id');
    }
}

