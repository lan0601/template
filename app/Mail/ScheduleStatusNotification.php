<?php

namespace App\Mail;

use App\Models\Schedule;
use App\Models\Schedule2;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ScheduleStatusNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Schedule2 $schedule,
        public string $status,
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->status === 'approved' 
            ? 'Your Appointment Has Been Approved' 
            : 'Your Appointment Has Been Rejected';

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        $statusMessage = $this->status === 'approved' ? 'approved' : 'rejected';
        $appointmentDate = \Carbon\Carbon::parse($this->schedule->start_datetime)->format('F j, Y');

        return new Content(
            view: 'emails.schedule-status',
            with: [
                'creatorName' => $this->schedule->user?->name ?? 'User',
                'statusMessage' => $statusMessage,
                'appointmentDate' => $appointmentDate,
                'scheduleTitle' => $this->schedule->title,
                'scheduleDescription' => $this->schedule->description,
                'statusBadge' => $this->status,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
