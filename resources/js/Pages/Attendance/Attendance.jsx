import { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import QRScanner from "@/Components/QRScanner";
import Modal from "@/Components/Modal";
import { Head, usePage } from "@inertiajs/react";
import Swal from "sweetalert2";
import axios from "axios";

export default function Dashboard() {
    const {
        auth,
        attendanceRecords: initialAttendanceRecords = [],
        teacherSubjects: initialTeacherSubjects = [],
        flash = {},
    } = usePage().props;

    const user = auth.user;

    const [attendanceRecords, setAttendanceRecords] = useState(initialAttendanceRecords);
    const [teacherSubjects, setTeacherSubjects] = useState(initialTeacherSubjects);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [subjectStudents, setSubjectStudents] = useState([]);
    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const [loadingSubjectStudents, setLoadingSubjectStudents] = useState(false);
    const [markingStudentId, setMarkingStudentId] = useState(null);

    const handleScan = async (roomCode) => {
        try {
            const res = await axios.post(route("attendance.scan"), {
                room_code: roomCode,
            });

            if (res.data.status === "error") {
                Swal.fire({
                    icon: "error",
                    title: "No Schedule",
                    text: res.data.message,
                });
                return;
            }

            if (res.data.status === "warning") {
                Swal.fire({
                    icon: "warning",
                    title: "Already Scanned",
                    text: res.data.message,
                });
                return;
            }

            await Swal.fire({
                icon: "success",
                title: "Success",
                text: "Attendance marked!",
            });

            if (res.data.record) {
                setAttendanceRecords((prev) => [res.data.record, ...prev]);
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Something went wrong.",
            });
        }
    };

    const handleEdit = (record) => {
        console.log("Edit:", record);

        // Example:
        // router.get(route("attendance.edit", record.id));
    };

    useEffect(() => {
        if (flash?.error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: flash.error,
            });
        }
    }, [flash]);

    const records =
        user.role === "Teacher"
            ? teacherSubjects
            : attendanceRecords;

    const openSubjectModal = async (subject) => {
        setSelectedSubject(subject);
        setShowSubjectModal(true);
        setLoadingSubjectStudents(true);

        try {
            const response = await axios.get(route('attendance.subject.students', subject.id));
            console.log(response);
            setSubjectStudents(response.data.students || []);
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Unable to load students',
                text: 'Please refresh the page and try again.',
            });
            setSubjectStudents([]);
        } finally {
            setLoadingSubjectStudents(false);
        }
    };

    const closeSubjectModal = () => {
        setSelectedSubject(null);
        setSubjectStudents([]);
        setShowSubjectModal(false);
    };

    const markAttendance = async (studentId, status) => {
        if (!selectedSubject) {
            return;
        }

        setMarkingStudentId(studentId);

        try {
            const response = await axios.post(route('attendance.subject.mark', selectedSubject.id), {
                student_id: studentId,
                status,
            });

            if (response.data.status === 'success') {
                setSubjectStudents((prev) =>
                    prev.map((student) =>
                        student.id === studentId
                            ? { ...student, status: response.data.attendance.status }
                            : student
                    )
                );
                Swal.fire({
                    icon: 'success',
                    title: 'Updated',
                    text: `Marked student as ${status}.`,
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Unable to update attendance',
                text: 'Please try again.',
            });
        } finally {
            setMarkingStudentId(null);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Attendance Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="pb-12">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">

                        {/* Student Only */}
                        {["Student", "Admin"].includes(user.role) && (
                            <QRScanner onScan={handleScan} />
                        )}

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {user.role === "Teacher"
                                    ? "My Subjects"
                                    : "Recent Attendance"}
                            </h3>

                            <div className="mt-4 overflow-x-auto">
                                {user.role === "Teacher" ? (
                                    teacherSubjects.length > 0 ? (
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                        Subject
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                        Code
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                        Classroom
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                        Section
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                        School Year
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                        Semester
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                        Status
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {teacherSubjects.map((subject) => (
                                                    <tr key={subject.id}>
                                                        <td className="px-4 py-3 text-sm text-gray-700">
                                                            {subject.subject_name}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-700">
                                                            {subject.subject_code}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-700">
                                                            {subject.classroom}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-700">
                                                            {subject.section}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-700">
                                                            {subject.school_year}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-700">
                                                            {subject.semester}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-700">
                                                            {subject.status}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <button
                                                                onClick={() => openSubjectModal(subject)}
                                                                className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                                                            >
                                                                View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            No subjects are assigned to you.
                                        </p>
                                    )
                                ) : records.length > 0 ? (
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {user.role === "Teacher" && (
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                        Student
                                                    </th>
                                                )}

                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Date
                                                </th>

                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Time
                                                </th>

                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Classroom
                                                </th>

                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Subject
                                                </th>

                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {records.map((record) => (
                                                <tr key={record.id}>
                                                    {user.role === "Teacher" && (
                                                        <td className="px-4 py-3 text-sm text-gray-700">
                                                            {record.student_name}
                                                        </td>
                                                    )}

                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                        {record.date}
                                                    </td>

                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                        {record.time}
                                                    </td>

                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                        {record.classroom}
                                                    </td>

                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                        {record.subject}
                                                    </td>

                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                        {record.status}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        No attendance records found.
                                    </p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <Modal show={showSubjectModal} onClose={closeSubjectModal} maxWidth="2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Subject Details</h2>
                            {selectedSubject && (
                                <p className="mt-1 text-sm text-gray-500">
                                    {selectedSubject.subject_name} • {selectedSubject.subject_code}
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={closeSubjectModal}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            Close
                        </button>
                    </div>

                    {selectedSubject ? (
                        <div className="mt-4 text-sm text-gray-700">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <span className="font-semibold">Classroom:</span> {selectedSubject.classroom}
                                </div>
                                <div>
                                    <span className="font-semibold">Section:</span> {selectedSubject.section}
                                </div>
                                <div>
                                    <span className="font-semibold">School Year:</span> {selectedSubject.school_year}
                                </div>
                                <div>
                                    <span className="font-semibold">Semester:</span> {selectedSubject.semester}
                                </div>
                                <div>
                                    <span className="font-semibold">Status:</span> {selectedSubject.status}
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="text-base font-semibold text-gray-900">Enrolled Students</h3>
                                <div className="mt-3 overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Student</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Attendance</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {loadingSubjectStudents ? (
                                                <tr>
                                                    <td colSpan="4" className="px-3 py-6 text-center text-sm text-gray-500">
                                                        Loading students...
                                                    </td>
                                                </tr>
                                            ) : subjectStudents.length > 0 ? (
                                                console.log(subjectStudents),
                                                subjectStudents.map((student) => (
                                                    <tr key={student.id}>
                                                        <td className="px-3 py-3 text-sm text-gray-700">{student.name}</td>
                                                        <td className="px-3 py-3 text-sm text-gray-500">{student.email}</td>
                                                        <td className="px-3 py-3 text-sm text-gray-700 capitalize">{student.status}</td>
                                                        <td className="px-3 py-3 text-sm text-gray-700">
                                                            <div className="flex flex-wrap gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => markAttendance(student.id, 'present')}
                                                                    disabled={markingStudentId === student.id}
                                                                    className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700 disabled:opacity-50"
                                                                >
                                                                    Present
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => markAttendance(student.id, 'absent')}
                                                                    disabled={markingStudentId === student.id}
                                                                    className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-50"
                                                                >
                                                                    Absent
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="px-3 py-6 text-center text-sm text-gray-500">
                                                        No Enrolled Student in this subject
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-4 text-sm text-gray-500">No subject selected.</p>
                    )}
                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            onClick={closeSubjectModal}
                            className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}