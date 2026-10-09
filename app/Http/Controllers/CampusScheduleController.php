<?php

namespace App\Http\Controllers;

use App\Models\ExternalSchedule;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CampusScheduleController extends Controller
{
    public function index()
    {
        return Inertia::render('CampusSchedule/Index');
    }

    public function get(Request $request)
    {
        $user = $request->user();
        $campusId = trim((string) $user->campusID);

        if (! filled($campusId)) {
            return response()->json([]);
        }

        $query = ExternalSchedule::query()->where('is_active', true);

        if ($user->role === 'Teacher') {
            $query->select([
                'subject_code',
                'description',
                'days_code',
                'start_time',
                'end_time',
                'block_section',
                'class_room',
                'employee_last_name',
                'employee_first_name',
                'employee_middle_name',
                'semester_code',
                'school_year',
            ])
                ->where('employee_no', $campusId)
                ->where('school_year', (string) now()->year)
                ->distinct();
        } elseif ($user->role === 'Student') {
            $query->where('student_no', $campusId);
        } else {
            return response()->json([]);
        }

        $schedules = $query->get();

        $events = [];

        foreach ($schedules as $schedule) {
            $days = $this->parseDays($schedule->days_code);

            if ($days === []) {
                continue;
            }

            $teacherName = trim(implode(' ', array_filter([
                $schedule->employee_first_name,
                $schedule->employee_middle_name,
                $schedule->employee_last_name,
            ], fn ($value) => $value !== null && $value !== '')));

            $events[] = [
                'title' => trim((string) ($schedule->description ?: $schedule->subject_code ?: 'Campus Schedule')),
                'startTime' => $schedule->start_time ? \Carbon\Carbon::parse($schedule->start_time)->format('H:i:s') : '08:00:00',
                'endTime' => $schedule->end_time ? \Carbon\Carbon::parse($schedule->end_time)->format('H:i:s') : '09:00:00',
                'daysOfWeek' => $days,
                'extendedProps' => [
                    'subject' => $schedule->subject_code ?: 'N/A',
                    'room' => $schedule->class_room ?: 'N/A',
                    'teacher' => $teacherName !== '' ? $teacherName : 'N/A',
                    'section' => $schedule->block_section ?: 'N/A',
                    'semester' => $schedule->semester_code ?: 'N/A',
                    'schoolYear' => $schedule->school_year ?: 'N/A',
                ],
            ];
        }

        return response()->json($events);
    }

    private function parseDays(?string $daysCode): array
    {
        if ($daysCode === null || trim($daysCode) === '') {
            return [];
        }

        $clean = preg_replace('/[^A-Z]/', '', strtoupper($daysCode));

        if ($clean === '' || $clean === null) {
            return [];
        }

        $dayMap = [
            'SU' => 0,
            'M' => 1,
            'T' => 2,
            'W' => 3,
            'TH' => 4,
            'F' => 5,
            'S' => 6,
        ];

        $days = [];
        $length = strlen($clean);
        $index = 0;

        while ($index < $length) {
            $token = substr($clean, $index, 2);

            if (isset($dayMap[$token])) {
                $days[] = $dayMap[$token];
                $index += 2;
                continue;
            }

            $token = $clean[$index];
            if (isset($dayMap[$token])) {
                $days[] = $dayMap[$token];
            }

            $index++;
        }

        return array_values(array_unique($days));
    }
}
