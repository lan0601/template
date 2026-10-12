<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Schedule2;
use App\Models\Classroom;
use App\Models\Attendance;
use App\Models\ExternalAttendance;
use App\Models\ExternalSchedule;
use App\Models\EnrollmentSubject;
use App\Models\Subject;
use App\Models\SubjectOffering;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

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
            $legacyRecords = Attendance::query()
                ->where('user_id', $user->id)
                ->with(['subject', 'classroom'])
                ->orderByDesc('attendance_date')
                ->orderByDesc('time_in')
                ->get()
                ->map(function ($record) {
                    return [
                        'id' => $record->id,
                        'date' => Carbon::parse($record->attendance_date)->format('M j, Y'),
                        'time' => Carbon::parse($record->time_in)->format('h:i A'),
                        'classroom' => $record->classroom?->room_number ?? 'N/A',
                        'subject' => $record->subject?->subject_name ?? 'N/A',
                        'status' => $record->status,
                    ];
                });

            $externalRecords = ExternalAttendance::query()
                ->where('user_id', $user->id)
                ->where('is_active', true)
                ->orderByDesc('attendance_date')
                ->orderByDesc('time_in')
                ->get()
                ->map(function ($record) {
                    return [
                        'id' => 'external-' . $record->id,
                        'date' => Carbon::parse($record->attendance_date)->format('M j, Y'),
                        'time' => $record->time_in ? Carbon::parse($record->time_in)->format('h:i A') : 'N/A',
                        'classroom' => $record->class_room ?: 'N/A',
                        'subject' => $record->subject_code,
                        'status' => $record->status,
                    ];
                });

            $attendanceRecords = $legacyRecords->concat($externalRecords)
                ->sortByDesc(fn ($record) => $record['date'] . ' ' . $record['time'])
                ->values();

            return Inertia::render('Attendance/Attendance', [
                'attendanceRecords' => $attendanceRecords,
                'teacherSubjects' => [],
            ]);
        }

        if ($userRole === 'Teacher') {
            $now = now()->setTimezone('Asia/Manila');
            $teacherSubjects = ExternalSchedule::query()
                ->where('is_active', true)
                ->where('employee_no', trim((string) $user->campusID))
                ->where('school_year', (string) now()->year)
                ->whereNotNull('subject_code')
                ->orderBy('subject_code')
                ->get()
                ->groupBy('subject_code')
                ->map(function ($offering) use ($now) {
                    $schedule = $offering->first();

                    return [
                        'id' => (string) $schedule->subject_code,
                        'subject_name' => $schedule->description ?: $schedule->subject_code,
                        'subject_code' => $schedule->subject_code,
                        'classroom' => $offering->pluck('class_room')->filter()->unique()->implode(', ') ?: 'N/A',
                        'rooms' => $offering->pluck('class_room')->filter()->unique()->values(),
                        'schedule_time' => $offering
                            ->map(function ($row) {
                                $start = $row->start_time
                                    ? Carbon::parse($row->start_time)->format('g:i A')
                                    : 'N/A';
                                $end = $row->end_time
                                    ? Carbon::parse($row->end_time)->format('g:i A')
                                    : 'N/A';

                                return trim($start . ' - ' . $end);
                            })
                            ->unique()
                            ->implode('; '),
                        'section' => $offering->pluck('block_section')->filter()->unique()->implode(', ') ?: 'N/A',
                        'school_year' => $schedule->school_year,
                        'semester' => $schedule->semester_code ?: 'N/A',
                        'status' => 'Active',
                        'is_ongoing' => $offering->contains(
                            fn ($row) => $this->scheduleIsActiveNow($row, $now)
                        ),
                    ];
                })
                ->values();

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

    public function externalSubjectStudents(Request $request, string $subjectCode)
    {
        $teacher = $request->user();

        if ($teacher->role !== 'Teacher' || ! filled($teacher->campusID)) {
            abort(403);
        }

        $studentNumbers = ExternalSchedule::query()
            ->where('is_active', true)
            ->where('employee_no', trim((string) $teacher->campusID))
            ->where('school_year', (string) now()->year)
            ->where('subject_code', $subjectCode)
            ->whereNotNull('student_no')
            ->distinct()
            ->pluck('student_no');

        $usersByCampusId = User::query()
            ->whereIn('campusID', $studentNumbers)
            ->get(['id', 'name', 'lname', 'email', 'campusID'])
            ->keyBy('campusID');

        $attendanceByCampusId = ExternalAttendance::query()
            ->with(['creator:id,name', 'canceller:id,name'])
            ->where('employee_no', trim((string) $teacher->campusID))
            ->where('subject_code', $subjectCode)
            ->whereDate('attendance_date', now()->toDateString())
            ->whereIn('campus_id', $studentNumbers)
            ->get()
            ->keyBy('campus_id');

        $students = $studentNumbers->map(function ($campusId) use ($usersByCampusId, $attendanceByCampusId) {
            $student = $usersByCampusId->get($campusId);
            $attendance = $attendanceByCampusId->get($campusId);

            return [
                'id' => $student?->id,
                'campus_id' => $campusId,
                'name' => $student ? trim($student->name . ' ' . $student->lname) : 'No linked student account',
                'email' => $student?->email ?? 'N/A',
                'status' => ! $attendance
                    ? 'unmarked'
                    : ($attendance->is_active ? $attendance->status : 'cancelled'),
                'time' => $attendance?->time_in,
                'created_by' => $attendance?->creator?->name,
                'cancelled_by' => $attendance?->canceller?->name,
                'cancelled_at' => $attendance?->cancelled_at?->format('Y-m-d h:i A'),
            ];
        })->values();

        return response()->json(['students' => $students]);
    }

    public function markExternalStudentAttendance(Request $request, string $subjectCode)
    {
        $teacher = $request->user();

        if ($teacher->role !== 'Teacher' || ! filled($teacher->campusID)) {
            abort(403);
        }

        $validated = $request->validate([
            'campus_id' => ['required', 'string'],
            'status' => ['required', 'in:present,absent'],
        ]);

        $schedule = ExternalSchedule::query()
            ->where('is_active', true)
            ->where('employee_no', trim((string) $teacher->campusID))
            ->where('school_year', (string) now()->year)
            ->where('subject_code', $subjectCode)
            ->where('student_no', $validated['campus_id'])
            ->first();

        if (! $schedule) {
            abort(403);
        }

        $student = User::query()->where('campusID', $validated['campus_id'])->first();

        if (! $student) {
            return response()->json([
                'message' => 'The student has no linked account.',
            ], 422);
        }

        $now = now()->setTimezone('Asia/Manila');
        $attendance = ExternalAttendance::firstOrNew([
            'user_id' => $student->id,
            'subject_code' => $subjectCode,
            'attendance_date' => $now->toDateString(),
        ]);
        if (! $attendance->exists) {
            $attendance->created_by = $teacher->id;
        }
        $attendance->campus_id = $student->campusID;
        $attendance->employee_no = trim((string) $teacher->campusID);
        $attendance->class_room = $schedule->class_room;
        $attendance->time_in = $validated['status'] === 'present' ? $now->format('H:i:s') : null;
        $attendance->status = $validated['status'];
        $attendance->is_active = true;
        $attendance->save();

        return response()->json([
            'status' => 'success',
            'attendance' => [
                'campus_id' => $attendance->campus_id,
                'status' => $attendance->status,
                'time' => $attendance->time_in,
                'created_by' => $attendance->creator()->value('name') ?? $teacher->name,
            ],
        ]);
    }

    public function cancelExternalStudentAttendance(Request $request, string $subjectCode)
    {
        $teacher = $request->user();

        if ($teacher->role !== 'Teacher' || ! filled($teacher->campusID)) {
            abort(403);
        }

        $validated = $request->validate([
            'campus_id' => ['required', 'string'],
        ]);

        $scheduleExists = ExternalSchedule::query()
            ->where('is_active', true)
            ->where('employee_no', trim((string) $teacher->campusID))
            ->where('school_year', (string) now()->year)
            ->where('subject_code', $subjectCode)
            ->where('student_no', $validated['campus_id'])
            ->exists();

        if (! $scheduleExists) {
            abort(403);
        }

        $attendance = ExternalAttendance::query()
            ->where('employee_no', trim((string) $teacher->campusID))
            ->where('subject_code', $subjectCode)
            ->where('campus_id', $validated['campus_id'])
            ->whereDate('attendance_date', now()->toDateString())
            ->where('is_active', true)
            ->first();

        if ($attendance) {
            $attendance->update([
                'is_active' => false,
                'cancelled_by' => $teacher->id,
                'cancelled_at' => now()->setTimezone('Asia/Manila'),
            ]);
            $attendance->load('canceller:id,name');
        }

        return response()->json([
            'status' => 'success',
            'attendance' => [
                'campus_id' => $validated['campus_id'],
                'status' => $attendance ? 'cancelled' : 'unmarked',
                'time' => null,
                'cancelled_by' => $attendance?->canceller?->name,
                'cancelled_at' => $attendance?->cancelled_at?->format('Y-m-d h:i A'),
            ],
        ]);
    }

    public function externalSubjectQr(Request $request, string $subjectCode)
    {
        $teacher = $request->user();

        if ($teacher->role !== 'Teacher' || ! filled($teacher->campusID)) {
            abort(403);
        }

        $now = now()->setTimezone('Asia/Manila');
        $activeSchedules = ExternalSchedule::query()
            ->where('is_active', true)
            ->where('employee_no', trim((string) $teacher->campusID))
            ->where('school_year', (string) $now->year)
            ->where('subject_code', $subjectCode)
            ->get()
            ->filter(fn ($schedule) => $this->scheduleIsActiveNow($schedule, $now));

        if ($activeSchedules->isEmpty()) {
            return response()->json([
                'message' => 'There is no active schedule for this subject right now.',
            ], 422);
        }

        $expiresAt = $now->copy()->addMinutes(15)->timestamp;
        $teacherEmployeeNo = trim((string) $teacher->campusID);
        $signaturePayload = implode('|', [$teacherEmployeeNo, $subjectCode, $expiresAt]);
        $signature = hash_hmac(
            'sha256',
            $signaturePayload,
            config('app.key')
        );
        $payload = implode('|', ['ATTENDANCE', $teacherEmployeeNo, $subjectCode, $expiresAt, $signature]);

        return response()->json([
            'qrCode' => base64_encode(QrCode::format('svg')->size(400)->margin(4)->generate($payload)),
            'expiresAt' => $expiresAt,
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
                    'dataNow' => now()->toDateString(),
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
        $now = now()->setTimezone('Asia/Manila');
        
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

        $attendanceDate = $now->toDateString();
        $attendanceTime = $now->format('H:i:s');

        $attendance = Attendance::updateOrCreate([
            'user_id' => $validated['student_id'],
            'subject_id' => $subjectOffering->subject_id,
            'attendance_date' => $attendanceDate,
        ], [
            'campus_id' => User::whereKey($validated['student_id'])->value('campusID'),
            'subject_code' => $subjectOffering->subject?->subject_code,
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

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized',
            ], 401);
        }

        $now = now()->setTimezone('Asia/Manila');
        $qrCode = (string) $request->input('qr_code', '');

        if (preg_match('/^ATTENDANCE\|([^|]+)\|([^|]+)\|(\d+)\|([a-f0-9]{64})$/', $qrCode, $matches)) {
            return $this->scanExternalScheduleQr(
                $user,
                $matches[1],
                $matches[2],
                (int) $matches[3],
                $matches[4],
                $now
            );
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Invalid attendance QR code. Scan the QR currently displayed by your teacher.',
        ]);
    }

    private function scanExternalScheduleQr(
        User $user,
        string $teacherEmployeeNo,
        string $subjectCode,
        int $expiresAt,
        string $signature,
        Carbon $now
    ) {
        if ($user->role !== 'Student' || ! filled($user->campusID)) {
            return response()->json([
                'status' => 'error',
                'message' => 'This attendance QR is for students only.',
            ]);
        }

        $signaturePayload = implode('|', [$teacherEmployeeNo, $subjectCode, $expiresAt]);
        $expectedSignature = hash_hmac('sha256', $signaturePayload, config('app.key'));

        if ($expiresAt < $now->timestamp || ! hash_equals($expectedSignature, $signature)) {
            return response()->json([
                'status' => 'error',
                'message' => 'This classroom QR code has expired or is invalid. Ask your teacher to generate a new one.',
            ]);
        }

        $campusId = trim((string) $user->campusID);
        $schedule = ExternalSchedule::query()
            ->where('is_active', true)
            ->where('employee_no', $teacherEmployeeNo)
            ->where('school_year', (string) $now->year)
            ->where('subject_code', $subjectCode)
            ->where('student_no', $campusId)
            ->get()
            ->first(fn ($row) => $this->scheduleIsActiveNow($row, $now));

        if (! $schedule) {
            return response()->json([
                'status' => 'error',
                'message' => 'No matching student schedule is active for you at this day and time.',
            ]);
        }

        $attendanceDate = $now->toDateString();
        $existingAttendance = ExternalAttendance::query()
            ->where('user_id', $user->id)
            ->where('employee_no', $teacherEmployeeNo)
            ->where('subject_code', $subjectCode)
            ->whereDate('attendance_date', $attendanceDate)
            ->first();

        if ($existingAttendance?->is_active) {
            return response()->json([
                'status' => 'warning',
                'message' => 'You already scanned attendance for this subject today.',
                'record' => [
                    'id' => $existingAttendance->id,
                    'date' => Carbon::parse($existingAttendance->attendance_date)->format('M j, Y'),
                    'time' => $existingAttendance->time_in,
                    'classroom' => $existingAttendance->class_room ?? 'N/A',
                    'subject' => $subjectCode,
                    'status' => $existingAttendance->status,
                ],
            ]);
        }

        $attendance = $existingAttendance ?? new ExternalAttendance([
            'user_id' => $user->id,
            'created_by' => $user->id,
            'employee_no' => $teacherEmployeeNo,
            'subject_code' => $subjectCode,
            'attendance_date' => $attendanceDate,
        ]);
        $attendance->campus_id = $campusId;
        $attendance->class_room = $schedule->class_room;
        $attendance->time_in = $now->format('H:i:s');
        $attendance->status = 'present';
        $attendance->is_active = true;
        $attendance->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Attendance recorded successfully!',
            'record' => [
                'id' => $attendance->id,
                'date' => Carbon::parse($attendance->attendance_date)->format('M j, Y'),
                'time' => $attendance->time_in,
                'classroom' => $schedule->class_room ?: 'N/A',
                'subject' => $subjectCode,
                'status' => $attendance->status,
            ],
        ]);
    }

    private function scheduleIsActiveNow(ExternalSchedule $schedule, Carbon $now): bool
    {
        if (! $schedule->start_time || ! $schedule->end_time) {
            return false;
        }

        $days = $this->parseExternalDays($schedule->days_code);
        if (! in_array($now->dayOfWeek, $days, true)) {
            return false;
        }

        $currentTime = $now->format('H:i:s');
        $startTime = Carbon::parse($schedule->start_time)->format('H:i:s');
        $endTime = Carbon::parse($schedule->end_time)->format('H:i:s');

        return $currentTime >= $startTime && $currentTime <= $endTime;
    }

    private function parseExternalDays(?string $daysCode): array
    {
        $clean = preg_replace('/[^A-Z]/', '', strtoupper((string) $daysCode));
        if ($clean === '') {
            return [];
        }

        $dayMap = ['SU' => 0, 'M' => 1, 'T' => 2, 'W' => 3, 'TH' => 4, 'F' => 5, 'S' => 6];
        $days = [];
        $index = 0;

        while ($index < strlen($clean)) {
            $pair = substr($clean, $index, 2);
            if (isset($dayMap[$pair])) {
                $days[] = $dayMap[$pair];
                $index += 2;
                continue;
            }

            if (isset($dayMap[$clean[$index]])) {
                $days[] = $dayMap[$clean[$index]];
            }
            $index++;
        }

        return array_values(array_unique($days));
    }

    public function subjectQr(SubjectOffering $subjectOffering)
    {
        $user = Auth::user();

        if ($user->role !== 'Teacher' || $subjectOffering->teacher_id !== $user->id) {
            abort(403);
        }

        $payload = 'ATTENDANCE-OFFERING-' . $subjectOffering->id;

        return response(QrCode::format('svg')->size(320)->margin(2)->generate($payload))
            ->header('Content-Type', 'image/svg+xml');
    }

}
