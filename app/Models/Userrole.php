<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Userrole extends Model
{
    protected $fillable = [
        'id',
        'role_name',
        'status',
        'remove',
    ];
}
