<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use App\Models\Schedule;
use App\Models\User;
use App\Mail\ScheduleStatusNotification;
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
        ]);
    }

    private function sendStatusSms(Schedule $schedule, string $status): array
    {
        $recipientPhone = $schedule->user?->phone ?? '09550591882';
        $creatorName = $schedule->user?->name ?? 'User';
        $statusMessage = $status === 'approved' ? 'approved' : 'rejected';
        $appointmentDate = \Carbon\Carbon::parse($schedule->start_datetime)->format('F j, Y');

        $message = "Dear {$creatorName},\n\n" .
            "Your appointment request has been {$statusMessage}.\n\n" .
            "Appointment Date: {$appointmentDate}\n\n" .
            "Please arrive at your scheduled appointment. " .
            "If you need to reschedule or cancel, please contact us in advance.\n\n" .
            "Thank you.";

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
