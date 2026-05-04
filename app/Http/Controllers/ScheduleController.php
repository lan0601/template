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
        $userId = auth()->id();

        $events = Schedule::with('approver')
            ->where(function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->orWhere('approved_by', $userId);
            })
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'title' => $schedule->title,
                    'start' => \Carbon\Carbon::parse($schedule->start_datetime)->format('Y-m-d'),
                    'end' => \Carbon\Carbon::parse($schedule->end_datetime)
                        ->addDay()
                        ->format('Y-m-d'),
                    'description' => $schedule->description,
                    'status' => $schedule->status,
                    'approved_by' => $schedule->approved_by,
                    'approved_by_name' => $schedule->approver?->name,
                    'color' => $schedule->status === 'approved' ? 'green' : ($schedule->status === 'rejected' ? 'red' : 'blue'),
                    'textColor' => 'white',
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

    public function updateStatus(Request $request, Schedule $schedule)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $schedule->update([
            'status' => $request->status,
        ]);

        return response()->json([
            'success' => true,
            'status' => $schedule->status,
        ]);
    }
}
