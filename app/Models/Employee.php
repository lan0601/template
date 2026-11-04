<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    /**
     * Employees are managed through the application's users table.
     *
     * The model is retained for existing generated code, but does not
     * introduce a separate employees data store.
     */
    protected $table = 'users';

    protected $guarded = [];
}
