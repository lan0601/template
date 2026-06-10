<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Schedule2;
use App\Models\Classroom;
use App\Models\Enroll;
use App\Models\Attendance;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 401);
        }
        
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

    public function scan(Request $request)
    {
        $now = now()->dayOfWeekIso % 7;
        $time = now()->setTimezone('Asia/Manila')->format('H:i');

        $classroom = str_replace('CLASSROOM-', '', $request->room_code);

        $classroomId = Classroom::where('room_number', $classroom)->value('id');

        if (!$classroomId) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid classroom.'
            ]);
        }

        $schedule = Schedule2::where('classroom_id', $classroomId)
            ->where('day', $now)
            ->where('start_time', '<=', $time)
            ->where('end_time', '>=', $time)
            ->first();
            
        if (!$schedule) {
            return response()->json([
                'status' => 'error',
                'message' => 'No schedule found for this room at this time.'
            ]);
        }

        $user = Auth::user();

        $enroll = Enroll::where('user_id', $user->id)
            ->where('subject_id', $schedule->subject_id)->get();

        if(!$enroll){
            return response()->json([
                'status' =>'error',
                'message' => 'Not enrolled for this subject',
            ]);
        }
        

        // OPTIONAL: prevent duplicate attendance
        $exists = Attendance::where('user_id', $user->id)
            ->where('classroom_id', $classroomId)
            ->whereDate('attendance_date', now())
            ->first();

        if ($exists) {
            return response()->json([
                'status' => 'warning',
                'message' => 'You already scanned attendance for this class.'
            ]);
        }

        Attendance::create([
            'user_id' => $user->id,
            'subject_id' => $schedule->subject_id,
            'classroom_id' => $classroomId,
            'attendance_date' => now()->toDateString(),
            'time_in' => $time,
            'status' => 'present',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Attendance recorded successfully!'
        ]);
    }

}
