import { useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import Modal from '@/Components/Modal'
import Swal from 'sweetalert2';
import axios from 'axios'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



export default function Calendar({ events, users, classrooms, subjects }) {
    const { auth } = usePage().props
    const currentUserId = auth?.user?.id
    const [showModal, setShowModal] = useState(false)
    const [modalMode, setModalMode] = useState('create')
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [selectedCalendarEvent, setSelectedCalendarEvent] = useState(null)
    const canModifyStatus = selectedEvent?.approved_by === currentUserId
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        day: '',
        start_time: '',
        end_time: '',
        approved_by: '',
        room_id: '',
    })

    const addOneDay = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        d.setDate(d.getDate() + 1);
        return d.toISOString().split("T")[0];
    };

    const formatTime = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    };

    const handleCloseModal = () => {
        setShowModal(false)
        setSelectedEvent(null)
        setSelectedCalendarEvent(null)
    }

    // Handle single click for creating a schedule
    const handleDateClick = (selected) => {
        const end = new Date(selected.end)
        end.setDate(end.getDate() - 1) // FullCalendar fix (exclusive end)

        const start = new Date(selected.startStr).toLocaleDateString('en-CA')
        const formattedEnd = end.toLocaleDateString('en-CA')

        setFormData({
            title: '',
            description: '',
            start_date: start,
            end_date: formattedEnd,
            day: '',
            start_time: '',
            end_time: '',
            approved_by: '',
        })
        setModalMode('create')
        setShowModal(true)
    };

    const handleEventClick = (clickInfo) => {
        const event = clickInfo.event
        const start = event.start ? event.start.toLocaleDateString('en-CA') : ''
        let end = ''
        if (event.end) {
            const endDate = new Date(event.end)
            endDate.setDate(endDate.getDate() - 1)
            end = endDate.toLocaleDateString('en-CA')
        }
        
        setSelectedEvent({
            id: event.id,
            title: event.title,
            description: event.extendedProps.description || 'No description provided.',
            status: event.extendedProps.status || 'pending',
            approved_by: event.extendedProps.approved_by || null,
            approved_by_name: event.extendedProps.approved_by_name || 'Not assigned',
            day: event.extendedProps.day || '',
            start_date: start,
            end_date: addOneDay(end) || start,
            start_time: formatTime(event.start) || '',
            end_time: formatTime(event.end) || '',
        })
        setSelectedCalendarEvent(event)
        setModalMode('details')
        setShowModal(true)
    };

    const handleSubmit = () =>{
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const startDate = new Date(formData.start_date)

        if (startDate < today) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'warning',
                title: 'You cannot schedule in the past!',
                showConfirmButton: false,
                timer: 3000
            });
        }else{
            router.post('/schedule2/store', formData, {
                onError: (errors) => {
                    const errorMessages = Object.values(errors)
                        .flat()
                        .join('\n');
                    Swal.fire({
                        title: 'Missing Information',
                        text: errorMessages,
                        icon: 'warning'
                    });
                },
                onSuccess: () => {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'Saved Succesfully',
                        showConfirmButton: false,
                        timer: 3000
                    });
                    handleCloseModal()
                }
            })
        }
    }

    const handleStatusChange = async (status) => {
        if (!selectedEvent?.id) return

        axios.post(`/schedule2/${selectedEvent.id}/status`, { status })
            .then((response) => {
                console.log('Schedule status response:', response.data);

                // Close modal immediately
                handleCloseModal();

                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `Schedule ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
                    showConfirmButton: false,
                    timer: 3000
                });

                // Refresh the page to show updated colors
                setTimeout(() => {
                    router.reload()
                }, 1000)
            })
            .catch((error) => {
                Swal.fire({
                    title: 'Update failed',
                    text: error.response?.data?.message || 'Could not update schedule status.',
                    icon: 'error'
                });
            })
    }
        


    return (
        <div className="p-4 bg-white rounded-lg">
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
                headerToolbar ={{
                    left: 'prev,next' ,
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                validRange={{
                    start: new Date(), // 👈 only today onward
                }}
                initialView="dayGridMonth"
                editable={false}
                selectable={true}
                selectMirror={true}
                select={handleDateClick}

                // select={(info) => {
                //     console.log('Start:', info.startStr)
                //     console.log('End:', info.endStr)
                // }}

                // dateClick={(info) => {
                //     // Only trigger if NOT selecting range
                //     if (!info.jsEvent?.shiftKey) {
                //         console.log('Clicked:', info.dateStr)
                //     }

                // }}
                eventClick={handleEventClick}
                events={events}
                // events={[
                //     {title: 'Event 1' , 
                //     daysOfWeek: [1], // Monday
                //     startRecur: '2024-06-01',
                //     endRecur: '2026-07-01',
                //     startTime:'09:21',
                //     endTime: '10:21'},
                // ]}
            />
            {/* Modal */}
            <Modal show={showModal} onClose={handleCloseModal}>
                <div className="p-5">

                    {/* Header */}
                    <div className="flex justify-between items-center border-b pb-2">
                        <h2 className="text-lg font-bold">
                            {modalMode === 'details' ? 'Event Details' : 'Create Schedule'}
                        </h2>

                        {/* Close button */}
                        <button
                            onClick={handleCloseModal}
                            className="text-gray-500 hover:text-red-500 text-xl"
                        >
                            ✕
                        </button>
                    </div>

                    {modalMode === 'details' ? (
                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="text-sm font-medium">Title</label>
                                <p className="mt-1 text-gray-700">{selectedEvent?.title}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Start Date</label>
                                <p className="mt-1 text-gray-700">{selectedEvent?.start_date}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium">End Date</label>
                                <p className="mt-1 text-gray-700">{selectedEvent?.end_date}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Start Time</label>
                                <p className="mt-1 text-gray-700">{selectedEvent?.start_time}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium">End Time</label>
                                <p className="mt-1 text-gray-700">{selectedEvent?.end_time}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Status</label>
                                <p className="mt-1 text-gray-700 capitalize">{selectedEvent?.status}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Approved By</label>
                                <p className="mt-1 text-gray-700">{selectedEvent?.approved_by_name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <p className="mt-1 text-gray-700 whitespace-pre-line">{selectedEvent?.description}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="text-sm font-medium">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    required
                                    onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                    className="w-full border rounded p-2 mt-1"
                                    placeholder="Enter Event Title"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    className="w-full border rounded p-2 mt-1"
                                    placeholder="Enter event details"
                                />
                            </div>

                            {/* Room */}
                            <div>
                                <label className="text-sm font-medium">Room</label>
                                <select
                                    value={formData.classroom_id}
                                    required
                                    onChange={(e) =>
                                        setFormData({ ...formData, classroom_id: e.target.value })
                                    }
                                    className="w-full border rounded p-2 mt-1"
                                >
                                    <option value="">Select a Room</option>

                                    {classrooms.map((classroom) => (
                                        <option key={classroom.id} value={classroom.id}>
                                            {classroom.room_name} ({classroom.room_number})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="text-sm font-medium">Subject</label>
                                <select
                                    value={formData.subject_id}
                                    required
                                    onChange={(e) =>
                                        setFormData({ ...formData, subject_id: e.target.value })
                                    }
                                    className="w-full border rounded p-2 mt-1"
                                >
                                    <option value="">Select a Subject</option>

                                    {subjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.subject_name} ({subject.subject_code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Start Date */}
                            <div>
                                <label className="text-sm font-medium">Start Date</label>
                                <input
                                    // type="datetime-local"
                                    type="date"
                                    value={formData.start_date}
                                    required
                                    onChange={(e) =>
                                        setFormData({ ...formData, start_date: e.target.value })
                                    }
                                    className="w-full border rounded p-2 mt-1"
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label className="text-sm font-medium">End Date</label>
                                <input
                                    // type="datetime-local"
                                    type="date"
                                    value={formData.end_date}
                                    required
                                    onChange={(e) =>
                                        setFormData({ ...formData, end_date: e.target.value })
                                    }
                                    className="w-full border rounded p-2 mt-1"
                                />
                            </div>

                            {/* Day of the Week */}
                            <div>
                                <label className="text-sm font-medium">Day of the Week</label>
                                <select
                                    value={formData.day}
                                    onChange={(e) =>
                                        setFormData({ ...formData, day: e.target.value })
                                    }
                                    className="w-full border rounded p-2 mt-1"
                                >
                                    <option value="">Select Day</option>
                                    <option value="1">Monday</option>
                                    <option value="2">Tuesday</option>
                                    <option value="3">Wednesday</option>
                                    <option value="4">Thursday</option>
                                    <option value="5">Friday</option>
                                    <option value="6">Saturday</option>
                                    <option value="0">Sunday</option>
                                </select>
                            </div>

                            {/* Start Time */}
                            <div>
                                <label className="text-sm font-medium">Start Time</label>
                                <input
                                    // type="datetime-local"
                                    type="time"
                                    value={formData.start_time}
                                    required
                                    onChange={(e) =>
                                        setFormData({ ...formData, start_time: e.target.value })
                                    }
                                    className="w-full border rounded p-2 mt-1"
                                />
                            </div>

                            {/* End Time */}
                            <div>
                                <label className="text-sm font-medium">End Time</label>
                                <input
                                    // type="datetime-local"
                                    type="time"
                                    value={formData.end_time}
                                    required
                                    onChange={(e) =>
                                        setFormData({ ...formData, end_time: e.target.value })
                                    }
                                    className="w-full border rounded p-2 mt-1"
                                />
                            </div>

                            {/* Person */}
                            <div>
                                <label className="text-sm font-medium">Person</label>
                                <select
                                    value={formData.approved_by}
                                    required
                                    onChange={(e) =>
                                        setFormData({ ...formData, approved_by: e.target.value })
                                    }
                                    className="w-full border rounded p-2 mt-1"
                                >
                                    <option value="">Select a Approver</option>

                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>

                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex flex-wrap justify-end gap-2 mt-6">
                        <button
                            onClick={handleCloseModal}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            {modalMode === 'details' ? 'Close' : 'Cancel'}
                        </button>

                        {canModifyStatus && modalMode === 'details' && selectedEvent?.status === 'pending' && (
                            <>
                                <button
                                    onClick={() => handleStatusChange('rejected')}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleStatusChange('approved')}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Approve
                                </button>
                            </>
                        )}

                        {canModifyStatus && modalMode === 'details' && selectedEvent?.status === 'approved' && (
                            <button
                                onClick={() => handleStatusChange('rejected')}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Reject
                            </button>
                        )}

                        {canModifyStatus && modalMode === 'details' && selectedEvent?.status === 'rejected' && (
                            <button
                                onClick={() => handleStatusChange('approved')}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Approve
                            </button>
                        )}

                        {modalMode === 'create' && (
                            <button
                                onClick={handleSubmit}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                OK
                            </button>
                        )}
                    </div>

                </div>
            </Modal>
            
        </div>
    )
}