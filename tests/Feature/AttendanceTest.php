<?php

namespace Tests\Feature;

use App\Models\Attendance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_same_user_can_have_multiple_subject_attendance_records_on_the_same_day(): void
    {
        Attendance::create([
            'user_id' => 1,
            'subject_id' => 10,
            'classroom_id' => 20,
            'attendance_date' => '2026-08-07',
            'time_in' => '08:00:00',
            'status' => 'present',
        ]);

        $secondAttendance = Attendance::create([
            'user_id' => 1,
            'subject_id' => 11,
            'classroom_id' => 21,
            'attendance_date' => '2026-08-07',
            'time_in' => '09:00:00',
            'status' => 'present',
        ]);

        $this->assertDatabaseCount('attendances', 2);
        $this->assertSame(11, $secondAttendance->subject_id);
    }
}
