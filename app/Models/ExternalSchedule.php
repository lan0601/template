<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExternalSchedule extends Model
{
    protected $table = 'external_schedules';

    protected $fillable = [
        'student_no',
        'school_year',
        'semester_code',
        'subject_code',
        'description',
        'days_code',
        'start_time',
        'end_time',
        'block_section',
        'class_room',
        'employee_no',
        'employee_last_name',
        'employee_first_name',
        'employee_middle_name',
        'source_updated_at',
        'last_synced_at',
    ];
}
