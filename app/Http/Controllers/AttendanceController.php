<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Schedule;
use App\Models\User;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function index()
    {
        // $userId = auth()->id();

        // $events = Schedule::with('approver')
        //     ->where(function ($query) use ($userId) {
        //         $query->where('user_id', $userId)
        //             ->orWhere('approved_by', $userId);
        //     })
        //     ->get()
        //     ->map(function ($schedule) {
        //         return [
        //             'id' => $schedule->id,
        //             'title' => $schedule->title,
        //             'start' => \Carbon\Carbon::parse($schedule->start_datetime)->format('Y-m-d'),
        //             'end' => \Carbon\Carbon::parse($schedule->end_datetime)
        //                 ->addDay()
        //                 ->format('Y-m-d'),
        //             'description' => $schedule->description,
        //             'status' => $schedule->status,
        //             'approved_by' => $schedule->approved_by,
        //             'approved_by_name' => $schedule->approver?->name,
        //             'color' => $schedule->status === 'approved' ? 'green' : ($schedule->status === 'rejected' ? 'red' : 'blue'),
        //             'textColor' => 'white',
        //         ];
        //     });
        // $users = User::all();

        return Inertia::render('Attendance/Attendance', [
            // 'events' => $events,
            // 'users' => $users
        ]);
    }

}
