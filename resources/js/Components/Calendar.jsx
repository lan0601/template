import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

export default function Calendar({ schedules }) {
    // const events = schedules.map(schedule => ({
    //     title: schedule.title,
    //     start: schedule.start_datetime,
    //     end: schedule.end_datetime,
    // }))

    return (
        <div className="p-4 bg-white rounded-lg">
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                headerToolbar ={{
                    left: 'prev,next' ,
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                initialView="dayGridMonth"
                editable={true}
                selectable={true}
                selectMirror={true}
                events={[
                    {title: 'Event 1' , start:'2026-05-19', end: '2026-05-21'},
                ]}
            />
        </div>
    )
}