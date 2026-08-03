import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Schedule() {
    const { auth } = usePage().props;

    const fetchEvents = (fetchInfo, successCallback, failureCallback) => {
        // The route name is 'schedule2.events' from web.php
        
        axios.post(route('schedule2.events'))
            .then(response => {
                console.log(response.data)
                successCallback(response.data);
            })
            .catch(error => {
                console.error("Error fetching schedule events:", error);
                failureCallback(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Could not load schedule',
                    text: 'There was a problem fetching your schedule data.'
                });
            });
    };

    const handleEventClick = (clickInfo) => {
        const { title, extendedProps } = clickInfo.event;
        const { room, teacher } = extendedProps;

        // Using SweetAlert2 to show event details in a modal
        Swal.fire({
            title: `<strong>${title}</strong>`,
            html: `
                <div style="text-align: left; padding-left: 20px;">
                    <p><strong>Teacher:</strong> ${teacher}</p>
                    <p><strong>Room:</strong> ${room}</p>
                    <p><strong>Time:</strong> ${clickInfo.event.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${clickInfo.event.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
            `,
            showCloseButton: true,
            focusConfirm: false,
            confirmButtonText: 'Close',
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">My Schedule</h2>}
            user={auth.user}
        >
            <Head title="My Schedule" />

            <div className="py-6">
                <div className="max-w-full mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-4 sm:p-6 text-gray-900">
                            <FullCalendar
                                plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
                                initialView="timeGridWeek"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,listWeek'
                                }}
                                events={fetchEvents}
                                eventClick={handleEventClick}
                                allDaySlot={false} // We don't have all-day events for classes
                                slotMinTime="07:00:00" // Calendar starts at 7 AM
                                slotMaxTime="22:00:00" // Calendar ends at 10 PM
                                hiddenDays={[]} // Hide Sunda
                                height="auto" // Adjust height to content
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}