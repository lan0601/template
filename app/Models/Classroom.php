<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Classroom extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_name',
        'room_number',
        'building',
        'capacity',
        'status',
        'qr_path',
    ];
}
