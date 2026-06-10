<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use App\Models\Schedule2;
use App\Models\Classroom;
use App\Models\Subject;
use App\Models\User;
use App\Mail\ScheduleStatusNotification;
use Inertia\Inertia;

class Schedule2Controller extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        $events = Schedule2::with('approver')
            ->where(function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->orWhere('approved_by', $userId);
            })
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'title' => $schedule->title,

                    'daysOfWeek' => [$schedule->day], // Monday

                    'startTime' => \Carbon\Carbon::parse($schedule->start_time)->format('H:i:s'),
                    'endTime' => \Carbon\Carbon::parse($schedule->end_time)->format('H:i:s'),

                    'startRecur' => $schedule->start_date,
                    'endRecur' => $schedule->end_date,

                    'description' => $schedule->description,
                    'status' => $schedule->status,
                    'approved_by' => $schedule->approved_by,
                    'approved_by_name' => $schedule->approver?->name,

                    'color' => $schedule->status === 'approved'
                        ? 'green'
                        : ($schedule->status === 'rejected' ? 'red' : 'blue'),

                    'textColor' => 'white',
                ];
            });
            // dd($events);
        $users = User::all();
        $classrooms = Classroom::all();
        $subjects = Subject::all();
        // dd($users, $classrooms);

        return Inertia::render('Schedule2/Schedule2dashboard', [
            'events' => $events,
            'users' => $users,
            'classrooms' => $classrooms,
            'subjects' => $subjects,
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
            'classroom_id' => 'required',
            'subject_id' => 'required',
            'day' => 'required',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after_or_equal:start_time',
            'approved_by' => 'required',
        ]);

        Schedule2::create([
            'user_id' => auth()->id(),
            'title' => $request->title,
            'description' => $request->description,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'day' => $request->day,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'classroom_id' => $request->classroom_id,
            'subject_id' => $request->subject_id,
            'approved_by'=> $request->approved_by,
            'status' => 'pending',
            
        ]);

        return back();
    }

    public function updateStatus(Request $request, Schedule2 $schedule)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $schedule->update([
            'status' => $request->status,
        ]);

        $smsData = $this->sendStatusSms($schedule, $request->status);
        
        if ($schedule->user?->email) {
            Mail::to($schedule->user->email)->send(
                new ScheduleStatusNotification($schedule, $request->status)
            );
        }

        return response()->json([
            'success' => true,
            'status' => $schedule->status,
            'sms' => $smsData,
            'schedule' => $schedule,
        ]);
    }

    private function sendStatusSms(Schedule2 $schedule, string $status): array
    {
        $recipientPhone = $schedule->user?->phone ?? '09550591882';
        $creatorName = $schedule->user?->name ?? 'User';
        $statusMessage = $status === 'approved' ? 'approved' : 'rejected';
        $appointmentDate = \Carbon\Carbon::parse($schedule->start_datetime)->format('F j, Y');

        if ($status === 'approved') {
            $message = "Dear {$creatorName},\n\n" .
                "Good news! Your appointment has been APPROVED.\n\n" .
                "Appointment Date: {$appointmentDate}\n\n" .
                "Please arrive on time for your scheduled appointment.\n\n" .
                "Thank you.";
        } else {
            $message = "Dear {$creatorName},\n\n" .
                "We regret to inform you that your appointment has been REJECTED.\n\n" .
                "Appointment Date: {$appointmentDate}\n\n" .
                "You may contact us to reschedule or request another slot.\n\n" .
                "Thank you.";
        }

        $apiToken = env('IPROG_API_TOKEN');
        $baseUrl = env('IPROG_BASE_URL', 'https://www.iprogsms.com/api/v1/sms_messages');

        if (! $apiToken) {
            if (function_exists('logger')) {
                logger()->warning('IPROG SMS not sent because IPROG_API_TOKEN is not set.', [
                    'recipientPhone' => $recipientPhone,
                    'creatorName' => $creatorName,
                    'statusMessage' => $statusMessage,
                    'appointmentDate' => $appointmentDate,
                    'message' => $message,
                ]);
            }

            return [
                'recipientPhone' => $recipientPhone,
                'creatorName' => $creatorName,
                'statusMessage' => $statusMessage,
                'message' => $message,
                'sent' => false,
                'reason' => 'missing_api_token',
                'apiTokenConfigured' => false,
                'baseUrl' => $baseUrl,
            ];
        }

        $response = Http::asForm()->post($baseUrl, [
            'api_token' => $apiToken,
            'message' => $message,
            'phone_number' => $recipientPhone,
        ]);

        if (function_exists('logger')) {
            logger()->info('IPROG SMS response', [
                'recipientPhone' => $recipientPhone,
                'creatorName' => $creatorName,
                'statusMessage' => $statusMessage,
                'appointmentDate' => $appointmentDate,
                'message' => $message,
                'responseStatus' => $response->status(),
                'responseBody' => $response->body(),
            ]);
        }

        return [
            'recipientPhone' => $recipientPhone,
            'creatorName' => $creatorName,
            'statusMessage' => $statusMessage,
            'message' => $message,
            'sent' => $response->successful(),
            'responseStatus' => $response->status(),
            'responseBody' => $response->body(),
            'apiTokenConfigured' => true,
            'baseUrl' => $baseUrl,
        ];
    }
}
