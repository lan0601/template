import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

const roleOptions = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Student', label: 'Student' },
    { value: 'Teacher', label: 'Teacher' },
    { value: 'Guest', label: 'Guest' },
];

export default function Index({ users }) {
    const [selectedRoles, setSelectedRoles] = useState(() =>
        Object.fromEntries((users || []).map((user) => [user.id, user.role]))
    );
    const [savingId, setSavingId] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        lname: '',
        email: '',
        roleid: '4',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const handleRoleChange = (userId, role) => {
        setSelectedRoles((current) => ({
            ...current,
            [userId]: role,
        }));
    };

    const handleSave = (user) => {
        setSavingId(user.id);

        const nextRole = selectedRoles[user.id] || user.role;

        router.patch(
            route('userrole.update', user.id),
            { role: nextRole },
            {
                preserveScroll: true,
                onFinish: () => setSavingId(null),
            }
        );
    };

    const handleDelete = (user) => {
        setSavingId(user.id);

        router.delete(
            route('userrole.destroy', user.id),
            {
                preserveScroll: true,
                onFinish: () => setSavingId(null),
            }
        );
    };

    const submitCreate = (event) => {
        event.preventDefault();

        post(route('userrole.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowCreateForm(false);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Users
                </h2>
            }
        >
            <Head title="User Roles" />

            <div className="pb-12">
                <div className="">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                        <h3 className="text-lg font-medium text-gray-900">Users list</h3>
                        <button
                            type="button"
                            onClick={() => setShowCreateForm((current) => !current)}
                            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-center rounded hover:bg-blue-700"
                        >
                            {showCreateForm ? 'Cancel' : '+ New User'}
                        </button>
                    </div>

                    {showCreateForm && (
                        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h4 className="mb-4 text-lg font-semibold text-gray-900">Create New User</h4>
                            <form onSubmit={submitCreate} className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="name" value="First Name" />
                                    <TextInput
                                        id="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        onChange={(event) => setData('name', event.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="lname" value="Last Name" />
                                    <TextInput
                                        id="lname"
                                        value={data.lname}
                                        className="mt-1 block w-full"
                                        onChange={(event) => setData('lname', event.target.value)}
                                    />
                                    <InputError message={errors.lname} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="email" value="Email" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        className="mt-1 block w-full"
                                        onChange={(event) => setData('email', event.target.value)}
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="roleid" value="Select Role" />
                                    <select
                                        id="roleid"
                                        value={data.roleid}
                                        onChange={(event) => setData('roleid', event.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="4">Guest</option>
                                        <option value="3">Teacher</option>
                                        <option value="2">Student</option>
                                        <option value="1">Admin</option>
                                    </select>
                                    <InputError message={errors.roleid} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="phone" value="Phone" />
                                    <TextInput
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        className="mt-1 block w-full"
                                        onChange={(event) => setData('phone', event.target.value)}
                                    />
                                    <InputError message={errors.phone} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="password" value="Password" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        className="mt-1 block w-full"
                                        onChange={(event) => setData('password', event.target.value)}
                                        required
                                    />
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        className="mt-1 block w-full"
                                        onChange={(event) => setData('password_confirmation', event.target.value)}
                                        required
                                    />
                                    <InputError message={errors.password_confirmation} className="mt-2" />
                                </div>

                                <div className="md:col-span-2 flex justify-end">
                                    <PrimaryButton disabled={processing}>Create User</PrimaryButton>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Phone Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                                                No users found.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {user.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {user.phone || '—'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <select
                                                        value={selectedRoles[user.id] || user.role}
                                                        onChange={(event) => handleRoleChange(user.id, event.target.value)}
                                                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    >
                                                        {roleOptions.map((role) => (
                                                            <option key={role.value} value={role.value}>
                                                                {role.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSave(user)}
                                                        disabled={savingId === user.id}
                                                        className="inline-flex items-center rounded bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {savingId === user.id ? 'Saving...' : 'Save'}
                                                    </button><button
                                                        type="button"
                                                        onClick={() => handleDelete(user)}
                                                        disabled={savingId === user.id}
                                                        className="inline-flex items-center rounded bg-red-600 px-3 py-1.5 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {savingId === user.id ? 'Deleting...' : 'Delete'}
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
        </AuthenticatedLayout>
    );
}
