import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Create() {
    const { subjects = [], teachers = [], classrooms = [], sections = [] } = usePage().props;
    console.log(classrooms);
    const { data, setData, post, errors, processing } = useForm({
        subject_id: subjects[0]?.id || '',
        teacher_id: teachers[0]?.id || '',
        classroom_id: classrooms[0]?.id || '',
        section: sections[0]?.section_name || '',
        term: 1,
        school_year: '2026-2027',
        semester: '1st Semester',
        day: 'Monday',
        start_time: '08:00',
        end_time: '10:00',
        capacity: 50,
        status: 1,
    });

    const handleChange = (e) => {
        setData(e.target.name, e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('subjectoffering.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Create Subject Offering
                </h2>
            }
        >
            <Head title="Create Subject Offering" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow sm:rounded-lg p-6 border border-gray-200">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Subject */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Subject
                                    </label>
                                    <select
                                        name="subject_id"
                                        value={data.subject_id}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    >
                                        <option value="" disabled>Select Subject</option>
                                        {subjects.map((sub) => (
                                            <option key={sub.id} value={sub.id}>
                                                {sub.subject_code} - {sub.subject_name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.subject_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.subject_id}</p>
                                    )}
                                </div>

                                {/* Teacher */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Teacher
                                    </label>
                                    <select
                                        name="teacher_id"
                                        value={data.teacher_id}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    >
                                        <option value="" disabled>Select Teacher</option>
                                        {teachers.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name} ({t.email})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.teacher_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.teacher_id}</p>
                                    )}
                                </div>

                                {/* Classroom */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Classroom / Room
                                    </label>
                                    <select
                                        name="classroom_id"
                                        value={data.classroom_id}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    >
                                        <option value="" disabled>Select Classroom</option>
                                        {classrooms.map((room) => (
                                            console.log(room),
                                            <option key={room.id} value={room.id}>
                                                {room.room_number}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.classroom_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.classroom_id}</p>
                                    )}
                                </div>

                                {/* Section */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Section
                                    </label>
                                    <input
                                        type="text"
                                        name="section"
                                        value={data.section}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                        placeholder="e.g. BSIT-1A"
                                    />
                                    {errors.section && (
                                        <p className="mt-1 text-sm text-red-600">{errors.section}</p>
                                    )}
                                </div>

                                {/* Day */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Day
                                    </label>
                                    <select
                                        name="day"
                                        value={data.day}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    >
                                        <option value="Monday">Monday</option>
                                        <option value="Tuesday">Tuesday</option>
                                        <option value="Wednesday">Wednesday</option>
                                        <option value="Thursday">Thursday</option>
                                        <option value="Friday">Friday</option>
                                        <option value="Saturday">Saturday</option>
                                        <option value="Sunday">Sunday</option>
                                        <option value="MWF">MWF (Mon/Wed/Fri)</option>
                                        <option value="TTH">TTH (Tue/Thu)</option>
                                    </select>
                                    {errors.day && (
                                        <p className="mt-1 text-sm text-red-600">{errors.day}</p>
                                    )}
                                </div>

                                {/* Capacity */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Capacity
                                    </label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={data.capacity}
                                        onChange={handleChange}
                                        min="1"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    />
                                    {errors.capacity && (
                                        <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
                                    )}
                                </div>

                                {/* Start Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Start Time
                                    </label>
                                    <input
                                        type="time"
                                        name="start_time"
                                        value={data.start_time}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    />
                                    {errors.start_time && (
                                        <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>
                                    )}
                                </div>

                                {/* End Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        End Time
                                    </label>
                                    <input
                                        type="time"
                                        name="end_time"
                                        value={data.end_time}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    />
                                    {errors.end_time && (
                                        <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>
                                    )}
                                </div>

                                {/* Term */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Term
                                    </label>
                                    <select
                                        name="term"
                                        value={data.term}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    >
                                        <option value={1}>Term 1</option>
                                        <option value={2}>Term 2</option>
                                        <option value={3}>Term 3</option>
                                        <option value={4}>Term 4</option>
                                    </select>
                                    {errors.term && (
                                        <p className="mt-1 text-sm text-red-600">{errors.term}</p>
                                    )}
                                </div>

                                {/* Semester */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Semester
                                    </label>
                                    <select
                                        name="semester"
                                        value={data.semester}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    >
                                        <option value="1st Semester">1st Semester</option>
                                        <option value="2nd Semester">2nd Semester</option>
                                        <option value="Summer">Summer</option>
                                    </select>
                                    {errors.semester && (
                                        <p className="mt-1 text-sm text-red-600">{errors.semester}</p>
                                    )}
                                </div>

                                {/* School Year */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        School Year
                                    </label>
                                    <input
                                        type="text"
                                        name="school_year"
                                        value={data.school_year}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                        placeholder="e.g. 2026-2027"
                                    />
                                    {errors.school_year && (
                                        <p className="mt-1 text-sm text-red-600">{errors.school_year}</p>
                                    )}
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={data.status}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    >
                                        <option value={1}>Active</option>
                                        <option value={0}>Inactive</option>
                                    </select>
                                    {errors.status && (
                                        <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <Link
                                    href={route('subjectoffering')}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium transition"
                                >
                                    {processing ? 'Creating...' : 'Create Subject Offering'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

