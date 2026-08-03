<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EnrollmentSubject extends Model
{
    protected $fillable = [
        'enrollment_id',
        'subject_offering_id',
        'status',
        'final_grade',
        'remarks',
        'remove',
    ];

    protected $casts = [
        'remove' => 'boolean',
    ];

    public function getStatusAttribute($value)
    {
        return $value ? strtolower($value) : $value;
    }

    public function setStatusAttribute($value)
    {
        $this->attributes['status'] = $value ? strtolower($value) : $value;
    }

    /**
     * Get the enrollment that owns this enrolled subject.
     */
    public function enrollment()
    {

        return $this->belongsTo(Enrollment::class,'enrollment_id');
    }

    /**
     * Get the subject offering assigned to this enrolled subject.
     */
    public function subjectOffering()
    {
        return $this->belongsTo(SubjectOffering::class,'subject_offering_id');
    }
}
