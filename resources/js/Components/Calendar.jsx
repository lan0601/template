import { useState } from 'react'
import { router } from '@inertiajs/react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import Modal from '@/Components/Modal'
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



export default function Calendar({ events, users }) {
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        start_datetime: '',
        end_datetime: '',
        approved_by: '',
    })
    // console.log(formData)
    // Handle single click
    const handleDateClick = (selected) => {
        
        const end = new Date(selected.end)
        end.setDate(end.getDate() - 1) // FullCalendar fix (exclusive end)

        const start = new Date(selected.startStr).toLocaleDateString('en-CA')
        const formattedEnd = end.toLocaleDateString('en-CA')
        setFormData({
            title: '',
            start_datetime: start,
            end_datetime: formattedEnd,
            approved_by: '',
        })
        setShowModal(true)
    };

    const handleSubmit = () =>{
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const startDate = new Date(formData.start_datetime)

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
            router.post('/schedule/store', formData, {
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
                    setShowModal(false)
                }
            })
        }
        
        
        // send to backend here
        // setShowModal(false)

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
                events={events}
                // events={[
                //     {title: 'Event 1' , start:'2026-05-19', end: '2026-05-21'},
                // ]}
            />
            {/* Modal */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <div className="p-5">

                    {/* Header */}
                    <div className="flex justify-between items-center border-b pb-2">
                        <h2 className="text-lg font-bold">Create Schedule</h2>

                        {/* Close button */}
                        <button
                            onClick={() => setShowModal(false)}
                            className="text-gray-500 hover:text-red-500 text-xl"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Form */}
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
                        {/* Start Date */}
                        <div>
                            <label className="text-sm font-medium">Start Date</label>
                            <input
                                type="date"
                                value={formData.start_datetime}
                                required
                                onChange={(e) =>
                                    setFormData({ ...formData, start_datetime: e.target.value })
                                }
                                className="w-full border rounded p-2 mt-1"
                            />
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="text-sm font-medium">End Date</label>
                            <input
                                type="date"
                                value={formData.end_datetime}
                                required
                                onChange={(e) =>
                                    setFormData({ ...formData, end_datetime: e.target.value })
                                }
                                className="w-full border rounded p-2 mt-1"
                            />
                        </div>
                        {/* Person */}
                        <div>
                            <label className="text-sm font-medium">Person</label>
                            {/* <input
                                type="text"
                                value={formData.person}
                                onChange={(e) =>
                                    setFormData({ ...formData, person: e.target.value })
                                }
                                className="w-full border rounded p-2 mt-1"
                                placeholder="Enter name"
                            /> */}
                            {/* users dropdown */}
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

                    {/* Buttons */}
                    <div className="flex justify-end gap-2 mt-6">

                        {/* Cancel */}
                        <button
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>

                        {/* OK */}
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            OK
                        </button>

                    </div>

                </div>
            </Modal>
            
        </div>
    )
}