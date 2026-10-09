import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function CampusSchedule() {
    const { auth } = usePage().props;

    const fetchEvents = (fetchInfo, successCallback, failureCallback) => {
        axios.post(route('cschedule.events'))
            .then((response) => {
                successCallback(response.data);
            })
            .catch((error) => {
                console.error(error);
                failureCallback(error);
                console.log(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Could not load campus schedule',
                    text: 'There was a problem fetching the campus schedule data.',
                });
            });
    };

    const handleEventClick = (clickInfo) => {
        const { title, extendedProps } = clickInfo.event;
        const { subject, room, teacher, section, semester, schoolYear } = extendedProps;

        Swal.fire({
            title: `<strong>${title}</strong>`,
            html: `
                <div style="text-align: left; padding-left: 20px;">
                    <p><strong>Subject:</strong> ${subject}</p>
                    <p><strong>Teacher:</strong> ${teacher}</p>
                    <p><strong>Room:</strong> ${room}</p>
                    <p><strong>Section:</strong> ${section}</p>
                    <p><strong>Semester:</strong> ${semester}</p>
                    <p><strong>School Year:</strong> ${schoolYear}</p>
                    <p><strong>Time:</strong> ${clickInfo.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${clickInfo.event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
            `,
            showCloseButton: true,
            focusConfirm: false,
            confirmButtonText: 'Close',
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">C Schedule</h2>}
            user={auth.user}
        >
            <Head title="C Schedule" />

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
                                    right: 'dayGridMonth,timeGridWeek,listWeek',
                                }}
                                events={fetchEvents}
                                eventClick={handleEventClick}
                                allDaySlot={false}
                                slotMinTime="07:00:00"
                                slotMaxTime="22:00:00"
                                height="auto"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
