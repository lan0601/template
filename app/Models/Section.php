<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    protected $fillable = [
        'section_name',
        'course_id',
        'year_level',
        'school_year',
        'semester',
        'status',
    ];
}
