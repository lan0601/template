import { useState } from "react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import QRScanner from '@/Components/QRScanner';
import { Head, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import Swal from 'sweetalert2';



export default function Dashboard() {
    const { events = [], users = [] ,flash = {}} = usePage().props;

    const [scannedValue, setScannedValue] = useState("");

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
        // success logic here
        console.log(res.data);
    
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

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {<QRScanner onScan={handleScan} />}

                            {/* {scannedValue && (
                                <div className="mt-4">
                                    <strong>Scanned QR:</strong> {scannedValue}
                                </div>
                            )} */}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}