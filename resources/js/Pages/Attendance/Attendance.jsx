import { useState } from "react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import QRScanner from '@/Components/QRScanner';
import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import Swal from 'sweetalert2';

export default function Dashboard() {
    const { attendanceRecords: initialAttendanceRecords = [], flash = {} } = usePage().props;
    const [attendanceRecords, setAttendanceRecords] = useState(initialAttendanceRecords);

    // const handleScan = async (roomCode) => {
    //     const res = await router.post(route('attendance.scan'), {
    //         room_code: roomCode,
    //     });
    //     if (res.data.status === 'error') {
    //         Swal.fire({
    //             icon: 'error',
    //             title: 'No Schedule',
    //             text: res.data.message,
    //         })
    //         return;
    //     }
    //     await Swal.fire({
    //         icon: 'success',
    //         title: 'Success',
    //         text: 'Attendance marked!',
    //     });
    // };

    const handleScan = async (roomCode) => {
        
        const res = await axios.post(route('attendance.scan'), {
            room_code: roomCode,
        });
        // console.log(res.data.status);
        if (res.data.status === 'error') {
            Swal.fire({
                icon: 'error',
                title: 'No Schedule',
                text: res.data.message,
            })
            return;
        }else if (res.data.status === 'warning'){
            Swal.fire({
                icon: 'warning',
                title: 'Already Scanned',
                text: res.data.message,
            })
            return;
        }
        await Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Attendance marked!',
        });

        if (res.data.record) {
            setAttendanceRecords((prev) => [res.data.record, ...prev]);
        }
    };

    useEffect(() => {
        if (flash?.error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: flash.error,
            });
        }
    }, [flash]);
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
                <div>
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <QRScanner onScan={handleScan} />

                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-800">Recent Attendance</h3>
                                <div className="mt-4 overflow-x-auto">
                                    {attendanceRecords.length > 0 ? (
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Time</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Classroom</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Subject</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {attendanceRecords.map((record) => (
                                                    <tr key={record.id}>
                                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{record.date}</td>
                                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{record.time}</td>
                                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{record.classroom}</td>
                                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{record.subject}</td>
                                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{record.status}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-sm text-gray-500">No attendance records yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}