import { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import QRScanner from "@/Components/QRScanner";
import { Head, usePage } from "@inertiajs/react";
import Swal from "sweetalert2";
import axios from "axios";

export default function Dashboard() {
    const {
        auth,
        attendanceRecords: initialAttendanceRecords = [],
        teacherAttendance = [],
        flash = {},
    } = usePage().props;
    console.log(auth);

    const user = auth.user;

    const [attendanceRecords, setAttendanceRecords] = useState(initialAttendanceRecords);

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
            ? teacherAttendance
            : attendanceRecords;

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
                        {["Student", "admin"].includes(user.role) && (
                            <QRScanner onScan={handleScan} />
                        )}

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {user.role === "Teacher"
                                    ? "Student Attendance"
                                    : "Recent Attendance"}
                            </h3>

                            <div className="mt-4 overflow-x-auto">
                                {records.length > 0 ? (
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

                                                {user.role === "Teacher" && (
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                        Action
                                                    </th>
                                                )}
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

                                                    {user.role === "Teacher" && (
                                                        <td className="px-4 py-3">
                                                            <button
                                                                onClick={() => handleEdit(record)}
                                                                className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                                                            >
                                                                Edit
                                                            </button>
                                                        </td>
                                                    )}
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
        </AuthenticatedLayout>
    );
}