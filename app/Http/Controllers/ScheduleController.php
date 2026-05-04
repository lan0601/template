<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Schedule;
use App\Models\User;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index()
    {
        // return Inertia::render('Schedule/Scheduledashboard');
        $events = Schedule::all()->map(function ($schedule) {
            return [
                'title' => $schedule->title,
                'start' => \Carbon\Carbon::parse($schedule->start_datetime)->format('Y-m-d'),
                'end' => \Carbon\Carbon::parse($schedule->end_datetime)
                    ->addDay()
                    ->format('Y-m-d'),
            ];
        });
        $users = User::all();

        return Inertia::render('Schedule/Scheduledashboard', [
            'events' => $events,
            'users' => $users
        ]);
    }

    // public function new()
    // {
    //     return Inertia::render('Posts/NewSchedule');
    // }

    public function store(Request $request)
    {
        // dd($request->all());

        $request->validate([
            'title' => 'required',
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after_or_equal:start_datetime',
            'approved_by' => 'required',
        ]);

        Schedule::create([
            'user_id' => auth()->id(),
            'title' => $request->title,
            'description' => $request->description,
            'start_datetime' => $request->start_datetime,
            'end_datetime' => $request->end_datetime,
            'approved_by'=> $request->approved_by,
            'status' => 'pending',
        ]);

        return back();
    }
}
