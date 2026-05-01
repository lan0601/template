<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index()
    {
        return Inertia::render('Schedule/Scheduledashboard');
    }

    // public function new()
    // {
    //     return Inertia::render('Posts/NewSchedule');
    // }
}
