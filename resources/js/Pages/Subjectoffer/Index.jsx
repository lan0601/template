import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

export default function Index({ auth }) {
    const { subjectofferings, flash } = usePage().props;
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [offeringToDelete, setOfferingToDelete] = useState(null);

    const confirmDeletion = (offering) => {
        setOfferingToDelete(offering);
        setConfirmingDeletion(true);
    };

    const closeModal = () => {
        setConfirmingDeletion(false);
        setOfferingToDelete(null);
    };

    const deleteOffering = (e) => {
        e.preventDefault();
        if (offeringToDelete) {
            // Assuming you have a destroy route named 'subjectoffering.destroy'
            router.delete(route('subjectoffering.destroy', offeringToDelete.id), {
                onSuccess: () => closeModal(),
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Subject Offerings
                </h2>
            }
        >
            <Head title="Subject Offerings" />

            <div className="pb-12">
                <div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                        <h3 className="text-lg font-medium text-gray-900">Subject Offerings List</h3>
                        <Link
                            href={route('subjectoffering.create')}
                            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-center rounded hover:bg-blue-700 font-medium transition"
                        >
                            + New Subject Offering
                        </Link>
                    </div>

                    {flash?.success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{flash.success}</span>
                        </div>
                    )}

                    <div className="overflow-hidden bg-white shadow sm:rounded-lg border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Subject
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Section
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Teacher
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Room
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Schedule
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Term / SY
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Capacity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {subjectofferings.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="px-6 py-8 text-center text-sm text-gray-500">
                                                No subject offerings found. Click "+ New Subject Offering" to create one.
                                            </td>
                                        </tr>
                                    ) : (
                                        subjectofferings.map((offering) => (
                                            <tr key={offering.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    <div>{offering.subject?.subject_name || 'N/A'}</div>
                                                    <div className="text-xs text-gray-500">{offering.subject?.subject_code}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {offering.section}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {offering.teacher?.name || 'Unassigned'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {offering.classroom?.room_number || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <span className="font-medium">{offering.day}</span>
                                                    <div className="text-xs text-gray-500">
                                                        {offering.start_time} - {offering.end_time}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div>Term {offering.term} ({offering.semester})</div>
                                                    <div className="text-xs text-gray-500">SY {offering.school_year}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {offering.capacity}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {Number(offering.status) === 1 ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                    <Link
                                                        href={route('subjectoffering.edit', offering.id)}
                                                        className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => confirmDeletion(offering)}
                                                        className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={confirmingDeletion} onClose={closeModal}>
                <form onSubmit={deleteOffering} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Are you sure you want to delete this subject offering?
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        This action cannot be undone. This will remove the subject offering and may affect existing student enrollments.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                        <DangerButton className="ms-3">Delete Subject Offering</DangerButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
