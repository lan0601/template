<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Schedule2;
use App\Models\Classroom;
use App\Models\Attendance;
use App\Models\EnrollmentSubject;
use App\Models\Subject;
use App\Models\SubjectOffering;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

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

        $userRole = $user->role;

        // dd($userRole);
        
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
        if ($userRole === 'Student') {
            $attendanceRecords = Attendance::query()
                ->where('user_id', $user->id)
                ->with(['subject', 'classroom'])
                ->orderByDesc('attendance_date')
                ->orderByDesc('time_in')
                ->get()
                ->map(function ($record) {
                    return [
                        'id' => $record->id,
                        'date' => $record->attendance_date,
                        'time' => Carbon::parse($record->time_in)->format('h:i A'),
                        'classroom' => $record->classroom?->room_number ?? 'N/A',
                        'subject' => $record->subject?->subject_name ?? 'N/A',
                        'status' => $record->status,
                    ];
                });

            return Inertia::render('Attendance/Attendance', [
                'attendanceRecords' => $attendanceRecords,
                'teacherSubjects' => [],
            ]);
        }

        if ($userRole === 'Teacher') {
            $teacherSubjects = SubjectOffering::query()
                ->with(['subject', 'classroom'])
                ->where('teacher_id', $user->id)
                ->where('remove', 0)
                ->orderBy('school_year')
                ->orderBy('semester')
                ->get()
                ->map(function ($offering) {
                    return [
                        'id' => $offering->id,
                        'subject_name' => $offering->subject?->subject_name ?? 'N/A',
                        'subject_code' => $offering->subject?->subject_code ?? 'N/A',
                        'classroom' => $offering->classroom?->room_number ?? 'N/A',
                        'section' => $offering->section?? 'N/A',
                        'school_year' => $offering->school_year,
                        'semester' => $offering->semester,
                        'status' => $offering->status,
                    ];
                });

            return Inertia::render('Attendance/Attendance', [
                'attendanceRecords' => [],
                'teacherSubjects' => $teacherSubjects,
            ]);
        }

        $attendanceRecords = Attendance::query()
            ->with(['subject', 'classroom', 'user'])
            ->orderByDesc('attendance_date')
            ->orderByDesc('time_in')
            ->get()
            ->map(function ($record) {
                return [
                    'id' => $record->id,
                    'date' => $record->attendance_date,
                    'time' => Carbon::parse($record->time_in)->format('h:i A'),
                    'classroom' => $record->classroom?->room_number ?? 'N/A',
                    'subject' => $record->subject?->subject_name ?? 'N/A',
                    'status' => $record->status,
                    'student_name' => $record->user?->name ?? 'N/A',
                ];
            });

        return Inertia::render('Attendance/Attendance', [
            'attendanceRecords' => $attendanceRecords,
            'teacherSubjects' => [],
        ]);
    }

    public function subjectStudents(SubjectOffering $subjectOffering)
    {
        $user = Auth::user();

        if ($user->role !== 'Teacher' || $subjectOffering->teacher_id !== $user->id) {
            abort(403);
        }

        $students = SubjectOffering::where('id', $subjectOffering->id)
        ->where('remove', 0)
        ->with(['enrollments.enrollment.student'])
        ->get()
        ->flatMap(function ($offering) use ($subjectOffering) {

            return $offering->enrollments->map(function ($enrollmentSubject) use ($subjectOffering) {

                $student = $enrollmentSubject->enrollment->student;

                $attendance = Attendance::where('user_id', $student->id)
                    ->where('subject_id', $subjectOffering->subject_id)
                    ->whereDate('attendance_date', now()->toDateString())
                    ->first();

                return [
                    'id' => $student->id,
                    'name' => trim($student->name . ' ' . $student->lname),
                    'email' => $student->email,
                    'status' => $attendance?->status ?? 'unmarked',
                ];
            });

        })
        ->values();
        return response()->json([
            'students' => $students,
        ]);
    }

    public function markStudentAttendance(Request $request, SubjectOffering $subjectOffering)
    {
        $user = Auth::user();
        
        if ($user->role !== 'Teacher' || $subjectOffering->teacher_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'student_id' => ['required', 'exists:users,id'],
            'status' => ['required', 'in:present,absent,late'],
        ]);

        // return response()->json([
        //     'status' => 'success',
        //     'attendance' => [
        //         'user' => $user,
        //         'subjectOffering' =>$subjectOffering,
        //         'validated' =>$validated['student_id'],
        //         'date_now' => now()->toDateString(),
        //         // 'attendance' =>$attendance
        //         'classroom_id' => $subjectOffering->classroom_id,
        //         'status' => $validated['status'],
        //         'time_in' => now()->toDateString(),
        //     ],
        // ]);

        $attendanceDate = now()->toDateString();
        $attendanceTime = now()->format('H:i:s');

        $attendance = Attendance::updateOrCreate([
            'user_id' => $validated['student_id'],
            'subject_id' => $subjectOffering->subject_id,
            'attendance_date' => $attendanceDate,
        ], [
            'classroom_id' => $subjectOffering->classroom_id,
            'status' => $validated['status'],
            'time_in' => $attendanceTime,
        ]);
        
        

        return response()->json([
            'status' => 'success',
            'attendance' => [
                'student_id' => $attendance->user_id,
                'status' => $attendance->status,
            ],
        ]);
    }

    public function scan(Request $request)
    {
        $user = Auth::user();

        $dayName = now()->setTimezone('Asia/Manila')->format('l');
        $time = now()->setTimezone('Asia/Manila')->format('H:i');

        $classroom = str_replace('CLASSROOM-', '', $request->room_code);

        $classroomId = Classroom::where('room_number', $classroom)->value('id');

        if (!$classroomId) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid classroom.'
            ]);
        }

        $subjectOffering = SubjectOffering::query()
            ->where('classroom_id', $classroomId)
            ->where('day', $dayName)
            ->where('start_time', '<=', $time)
            ->where('end_time', '>=', $time)
            ->where('remove', 0)
            ->where('status', 1)
            ->with(['enrollments.enrollment.student'])
            ->get()
            ->flatMap(function ($offering) use ($user) {

                return $offering->enrollments->map(function ($enrollmentSubject) use ($user) {

                    $student = $enrollmentSubject->enrollment->student;

                    if ($student->id !== $user->id) {
                        return ['asdasdas' => $student,
                                'offering' => $enrollmentSubject];
                    }
                    // $attendance = Attendance::where('user_id', $student->id)
                    //     // ->where('subject_id', $subjectOffering->subject_id)
                    //     ->whereDate('attendance_date', now()->toDateString())
                    //     ->first();

                    return ['student_id' => $student->id];
                });

            });

        return response()->json([
            'subjectOffering' => $subjectOffering,
            'classroomId' => $classroomId,
            'now' => $dayName,
            'time' => $time,
        ]);

        if (!$subjectOffering) {
            return response()->json([
                'status' => 'error',
                'message' => 'No active subject offering found for this room at this time.'
            ]);
        }

        $user = Auth::user();

        $enrolled = EnrollmentSubject::whereHas('enrollment', function ($query) use ($user) {
            $query->where('user_id', $user->id)
                ->where('status', 'active');
        })
        ->whereHas('subjectOffering', function ($query) use ($subjectOffering) {
            $query->where('id', $subjectOffering->id);
        })
        ->exists();

        if (!$enrolled) {
            return response()->json([
                'status' => 'error',
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

        $attendance = Attendance::create([
            'user_id' => $user->id,
            'subject_id' => $subjectOffering->subject_id,
            'classroom_id' => $classroomId,
            'attendance_date' => now()->toDateString(),
            'time_in' => $time,
            'status' => 'present',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Attendance recorded successfully!',
            'record' => [
                'id' => $attendance->id,
                'date' => $attendance->attendance_date,
                'time' => $attendance->time_in,
                'classroom' => $attendance->classroom?->room_number ?? 'N/A',
                'subject' => $attendance->subject?->subject_name ?? 'N/A',
                'status' => $attendance->status,
            ],
        ]);
    }

}
