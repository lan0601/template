<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Appointment Status Update</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <p>Dear {{ $creatorName }},</p>

    <p>Your appointment request has been <strong>{{ $statusMessage }}</strong>.</p>

    <h3>Appointment Details:</h3>
    <ul>
        <li><strong>Title:</strong> {{ $scheduleTitle }}</li>
        <li><strong>Date:</strong> {{ $appointmentDate }}</li>
        @if($scheduleDescription)
            <li><strong>Description:</strong> {{ $scheduleDescription }}</li>
        @endif
    </ul>

    @if($statusMessage === 'approved')
        <p>Please arrive a few minutes before your scheduled appointment. If you need to reschedule or cancel, please contact us in advance.</p>
    @else
        <p>If you believe this is a mistake or would like to reschedule, please contact us as soon as possible.</p>
    @endif

    <p>Thank you.</p>

    <p><a href="{{ config('app.url') }}" style="display:inline-block;padding:10px 15px;background:#3097d1;color:#fff;text-decoration:none;border-radius:4px;">View Your Schedule</a></p>
</body>
</html>
