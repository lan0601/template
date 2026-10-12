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
    const [updatingCampusId, setUpdatingCampusId] = useState(null);
    const [qrSubject, setQrSubject] = useState(null);
    const [qrResult, setQrResult] = useState(null);
    const [qrSecondsRemaining, setQrSecondsRemaining] = useState(0);
    const [generatingQr, setGeneratingQr] = useState(false);

    const handleScan = async (roomCode) => {
        try {
            const res = await axios.post(route("attendance.scan"), {
                qr_code: roomCode,
            });
            console.log(res.data);

            if (res.data.status === "error") {
                console.log(res.data);
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

    useEffect(() => {
        if (!qrResult) return undefined;

        const timer = window.setInterval(() => {
            setQrSecondsRemaining((remaining) => {
                if (remaining <= 1) {
                    window.clearInterval(timer);
                    setQrResult(null);
                    return 0;
                }

                return remaining - 1;
            });
        }, 1000);

        return () => window.clearInterval(timer);
    }, [qrResult]);

    const records =
        user.role === "Teacher"
            ? teacherSubjects
            : attendanceRecords;

    const openSubjectModal = async (subject) => {
        setSelectedSubject(subject);
        setShowSubjectModal(true);
        setLoadingSubjectStudents(true);

        try {
            const response = await axios.get(route('attendance.external-subject.students', subject.subject_code));
            setSubjectStudents(response.data.students || []);
            console.log(response.data)
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

    const openQrModal = (subject) => {
        setQrSubject(subject);
        setQrResult(null);
        setQrSecondsRemaining(0);
    };

    const generateClassroomQr = async () => {
        if (!qrSubject) return;

        setGeneratingQr(true);

        try {
            const response = await axios.post(
                route('attendance.external-subject.qr', qrSubject.subject_code)
            );

            setQrResult(response.data.qrCode);
            setQrSecondsRemaining(Math.max(0, response.data.expiresAt - Math.floor(Date.now() / 1000)));
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Unable to generate QR',
                text: error.response?.data?.message || 'Please try again.',
            });
        } finally {
            setGeneratingQr(false);
        }
    };

    const markExternalAttendance = async (student, status) => {
        if (!selectedSubject || !student.id) return;

        setUpdatingCampusId(student.campus_id);

        try {
            const response = await axios.post(
                route('attendance.external-subject.mark', selectedSubject.subject_code),
                { campus_id: student.campus_id, status }
            );

            setSubjectStudents((currentStudents) => currentStudents.map((currentStudent) => (
                currentStudent.campus_id === student.campus_id
                    ? {
                        ...currentStudent,
                        status: response.data.attendance.status,
                        time: response.data.attendance.time,
                        created_by: response.data.attendance.created_by,
                    }
                    : currentStudent
            )));
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Unable to update attendance',
                text: error.response?.data?.message || 'Please try again.',
            });
        } finally {
            setUpdatingCampusId(null);
        }
    };

    const cancelExternalAttendance = async (student) => {
        if (!selectedSubject || !student.id || student.status === 'unmarked') return;

        const confirmation = await Swal.fire({
            icon: 'warning',
            title: 'Cancel attendance?',
            text: `This will clear today's attendance for ${student.name}.`,
            showCancelButton: true,
            confirmButtonText: 'Cancel Attendance',
            cancelButtonText: 'Keep Attendance',
            confirmButtonColor: '#b91c1c',
        });

        if (!confirmation.isConfirmed) return;

        setUpdatingCampusId(student.campus_id);

        try {
            const response = await axios.delete(
                route('attendance.external-subject.cancel', selectedSubject.subject_code),
                { data: { campus_id: student.campus_id } }
            );

            setSubjectStudents((currentStudents) => currentStudents.map((currentStudent) => (
                currentStudent.campus_id === student.campus_id
                    ? {
                        ...currentStudent,
                        status: response.data.attendance.status,
                        time: response.data.attendance.time,
                        cancelled_by: response.data.attendance.cancelled_by,
                        cancelled_at: response.data.attendance.cancelled_at,
                    }
                    : currentStudent
            )));
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Unable to cancel attendance',
                text: error.response?.data?.message || 'Please try again.',
            });
        } finally {
            setUpdatingCampusId(null);
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
                        {user.role === "Student" && (
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
                                                        Schedule Time
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
                                                            {subject.schedule_time || 'N/A'}
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
                                                                View Attendance
                                                            </button>
                                                            {subject.is_ongoing && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openQrModal(subject)}
                                                                    className="ml-2 rounded bg-emerald-700 px-3 py-1 text-white hover:bg-emerald-800"
                                                                >
                                                                    Generate QR
                                                                </button>
                                                            )}
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
                                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${record.status === 'present' ? 'bg-green-100 text-green-800' : record.status === 'absent' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'}`}>
                                                            {record.status}
                                                        </span>
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

            <Modal show={showSubjectModal} onClose={closeSubjectModal} maxWidth="7xl">
                <div className="min-w-0 p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Subject Attendance</h2>
                            {selectedSubject && (
                                <p className="mt-1 text-sm text-gray-500">
                                    {selectedSubject.subject_name} • {selectedSubject.subject_code}
                                </p>
                            )}
                        </div>
                        {/* <button
                            type="button"
                            onClick={closeSubjectModal}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            Close
                        </button> */}
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
                            </div>

                            <div className="mt-6">
                                <h3 className="text-base font-semibold text-gray-900">Students</h3>
                                <div className="mt-3 w-full min-w-0">
                                    <table className="w-full table-fixed divide-y divide-gray-200 text-xs sm:text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="w-[15%] px-1 py-2 text-left text-[10px] font-medium uppercase text-gray-500 sm:px-2 sm:text-xs">Campus ID</th>
                                                <th className="w-[18%] px-1 py-2 text-left text-[10px] font-medium uppercase text-gray-500 sm:px-2 sm:text-xs">Student</th>
                                                <th className="w-[23%] px-1 py-2 text-left text-[10px] font-medium uppercase text-gray-500 sm:px-2 sm:text-xs">Email</th>
                                                <th className="w-[13%] px-1 py-2 text-left text-[10px] font-medium uppercase text-gray-500 sm:px-2 sm:text-xs">Attendance</th>
                                                <th className="w-[10%] px-1 py-2 text-left text-[10px] font-medium uppercase text-gray-500 sm:px-2 sm:text-xs">Time</th>
                                                <th className="w-[25%] px-1 py-2 text-right text-[10px] font-medium uppercase text-gray-500 sm:px-2 sm:text-xs">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {loadingSubjectStudents ? (
                                                <tr>
                                                    <td colSpan="6" className="px-3 py-6 text-center text-sm text-gray-500">
                                                        Loading students...
                                                    </td>
                                                </tr>
                                            ) : subjectStudents.length > 0 ? (
                                                subjectStudents.map((student) => (
                                                    <tr key={student.campus_id}>
                                                        <td className="break-words px-1 py-3 text-gray-700 sm:px-2">{student.campus_id}</td>
                                                        <td className="break-words px-1 py-3 text-gray-700 sm:px-2">
                                                            <div>{student.name}</div>
                                                            {student.created_by && (
                                                                <div className="mt-1 text-[10px] text-gray-500">
                                                                    Marked by {student.created_by}
                                                                </div>
                                                            )}
                                                            {student.cancelled_at && (
                                                                <div className="mt-1 text-[10px] text-red-700">
                                                                    Cancelled by {student.cancelled_by || 'Unknown'} · {student.cancelled_at}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="break-all px-1 py-3 text-gray-500 sm:px-2">{student.email}</td>
                                                        <td className="px-1 py-3 text-gray-700 sm:px-2">
                                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${student.status === 'present' ? 'bg-green-100 text-green-800' : student.status === 'absent' ? 'bg-red-100 text-red-800' : student.status === 'cancelled' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-700'}`}>
                                                                {student.status}
                                                            </span>
                                                        </td>
                                                        <td className="break-words px-1 py-3 text-gray-500 sm:px-2">{student.time || 'N/A'}</td>
                                                        <td className="px-1 py-3 text-right sm:px-2">
                                                            <div className="flex flex-col justify-end gap-1 sm:flex-row sm:flex-wrap sm:gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => markExternalAttendance(student, 'present')}
                                                                    disabled={!student.id || updatingCampusId === student.campus_id}
                                                                    className="rounded bg-green-700 px-1 py-1 text-[10px] font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50 sm:px-2 sm:text-xs"
                                                                >
                                                                    Present
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => markExternalAttendance(student, 'absent')}
                                                                    disabled={!student.id || updatingCampusId === student.campus_id}
                                                                    className="rounded bg-red-700 px-1 py-1 text-[10px] font-medium text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50 sm:px-2 sm:text-xs"
                                                                >
                                                                    Absent
                                                                </button>
                                                                {['present', 'absent'].includes(student.status) && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => cancelExternalAttendance(student)}
                                                                        disabled={!student.id || updatingCampusId === student.campus_id}
                                                                        className="rounded bg-gray-700 px-1 py-1 text-[10px] font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:px-2 sm:text-xs"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="px-3 py-6 text-center text-sm text-gray-500">
                                                        No students found for this subject.
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

            <Modal
                show={Boolean(qrSubject)}
                onClose={() => {
                    setQrSubject(null);
                    setQrResult(null);
                }}
                maxWidth="sm"
            >
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900">Attendance QR</h2>
                    {qrSubject && (
                        <>
                            <p className="mt-1 text-sm text-gray-600">
                                {qrSubject.subject_name} · {qrSubject.subject_code}
                            </p>
                            {qrResult ? (
                                <div className="mt-5 text-center">
                                    <img
                                        className="mx-auto h-72 w-72 max-w-full"
                                        src={`data:image/svg+xml;base64,${qrResult}`}
                                        alt={`15-minute attendance QR for ${qrSubject.subject_code}`}
                                    />
                                    <p className="mt-3 text-sm font-medium text-gray-700">
                                        {qrSecondsRemaining > 0
                                            ? `Expires in ${Math.floor(qrSecondsRemaining / 60)}:${String(qrSecondsRemaining % 60).padStart(2, '0')}`
                                            : 'QR code expired. Generate a new one.'}
                                    </p>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={generateClassroomQr}
                                    disabled={generatingQr}
                                    className="mt-5 w-full rounded bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
                                >
                                    {generatingQr ? 'Generating...' : 'Generate 15-Minute QR'}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}