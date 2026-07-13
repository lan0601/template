import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useMemo } from 'react';

export default function Permissions({ roles, pages, permissions }) {
    const { data, setData, post, processing } = useForm({
        permissions: permissions || {},
    });

    const pageLabels = useMemo(() => ({
        dashboard: 'Dashboard',
        attendance: 'Attendance',
        enroll: 'Enroll',
        schedule: 'Schedule',
        classroom: 'Classroom',
        subject: 'Subject',
        users: 'Users',
    }), []);

    const handleToggle = (role, page) => {
        setData('permissions', {
            ...data.permissions,
            [role]: {
                ...(data.permissions[role] || {}),
                [page]: !(data.permissions[role]?.[page] || false),
            },
        });
    };

    const submit = (event) => {
        event.preventDefault();
        post(route('userrole.permissions.store'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Role Page Access</h2>}
        >
            <Head title="Role Page Access" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Manage page access by role</h3>
                                <p className="text-sm text-gray-600">Enable or disable access to the main management pages for each role.</p>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Role</th>
                                            {pages.map((page) => (
                                                <th key={page} className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                    {pageLabels[page] || page}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {roles.map((role) => (
                                            <tr key={role}>
                                                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 capitalize">{role}</td>
                                                {pages.map((page) => (
                                                    <td key={`${role}-${page}`} className="px-4 py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={Boolean(data.permissions[role]?.[page])}
                                                            onChange={() => handleToggle(role, page)}
                                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Save Permissions'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
