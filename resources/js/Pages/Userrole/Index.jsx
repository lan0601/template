import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

const roleOptions = ['Admin', 'Student', 'Teacher', 'Guest'];

export default function Index({ users }) {
    const { auth } = usePage().props;
    const [editingUser, setEditingUser] = useState(null);
    const [savingId, setSavingId] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importType, setImportType] = useState('teachers');
    const [searchQuery, setSearchQuery] = useState('');
    const fileInput = useRef(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        lname: '',
        email: '',
        roleid: '4',
        phone: '',
        campusID: '',
        password: '',
        password_confirmation: '',
    });
    const {
        data: editData,
        setData: setEditData,
        patch: patchProfile,
        processing: updatingProfile,
        errors: editErrors,
        reset: resetEdit,
        clearErrors: clearEditErrors,
    } = useForm({ name: '', lname: '', email: '', phone: '', campusID: '', role: 'Guest' });
    const {
        setData: setImportData,
        post: postImport,
        processing: importing,
        errors: importErrors,
        reset: resetImport,
        clearErrors: clearImportErrors,
    } = useForm({ file: null });

    const openEditModal = (user) => {
        setEditingUser(user);
        setEditData({
            name: user.name || '',
            lname: user.lname || '',
            email: user.email || '',
            phone: user.phone || '',
            campusID: user.campusID || '',
            role: roleOptions.find((role) => role.toLowerCase() === (user.role || '').toLowerCase()) || 'Guest',
        });
        clearEditErrors();
    };

    const closeEditModal = () => {
        if (updatingProfile) return;

        setEditingUser(null);
        resetEdit();
        clearEditErrors();
    };

    const submitEdit = (event) => {
        event.preventDefault();
        if (!editingUser) return;

        patchProfile(route('userrole.update', editingUser.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingUser(null);
                resetEdit();
            },
        });
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

    const handleImpersonate = (user) => {
        setSavingId(user.id);
        router.post(route('userrole.impersonate', user.id), {}, {
            onFinish: () => setSavingId(null),
        });
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

    const submitImport = (event) => {
        event.preventDefault();

        postImport(route(`userrole.import-${importType}`), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                resetImport();
                clearImportErrors();
                setShowImportModal(false);
                if (fileInput.current) fileInput.current.value = '';
            },
        });
    };

    const closeImportModal = () => {
        if (importing) return;

        setShowImportModal(false);
        resetImport();
        clearImportErrors();
        if (fileInput.current) fileInput.current.value = '';
    };

    const openImportModal = (type) => {
        setImportType(type);
        setShowImportModal(true);
    };

    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
    const filteredUsers = users.filter((user) => [
        user.name,
        user.lname,
        user.email,
        user.phone,
        user.campusID,
        user.role,
    ].some((value) => String(value || '').toLocaleLowerCase().includes(normalizedQuery)));

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
                    <div className="mb-6 flex flex-col gap-3">
                        <h3 className="text-lg font-medium text-gray-900">Users list</h3>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                {auth.user?.role?.toLowerCase() === 'admin' && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => openImportModal('teachers')}
                                            className="w-full rounded bg-emerald-700 px-4 py-2 text-center text-white hover:bg-emerald-800 sm:w-auto"
                                        >
                                            Import Teachers
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openImportModal('students')}
                                            className="w-full rounded bg-teal-700 px-4 py-2 text-center text-white hover:bg-teal-800 sm:w-auto"
                                        >
                                            Import Students
                                        </button>
                                    </>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm((current) => !current)}
                                    className="w-full rounded bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700 sm:w-auto"
                                >
                                    {showCreateForm ? 'Cancel' : '+ New User'}
                                </button>
                            </div>
                            <div className="relative w-full sm:w-72">
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Search users..."
                                    aria-label="Search users by name, email, phone, campus ID, or role"
                                    className="w-full rounded border-gray-300 pr-9 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        aria-label="Clear user search"
                                        className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-800"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>
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
                                    <InputLabel htmlFor="campusID" value="Campus ID" />
                                    <TextInput
                                        id="campusID"
                                        value={data.campusID}
                                        className="mt-1 block w-full"
                                        onChange={(event) => setData('campusID', event.target.value)}
                                    />
                                    <InputError message={errors.campusID} className="mt-2" />
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
                                            Campus ID
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
                                            {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                                                {normalizedQuery ? 'No users match your search.' : 'No users found.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {user.name}
                                                    {user.lname ? ` ${user.lname}` : ''}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {user.phone || '—'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {user.campusID || '—'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm capitalize text-gray-900">
                                                    {user.role || '—'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                    {auth.user?.role?.toLowerCase() === 'admin' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleImpersonate(user)}
                                                            disabled={savingId === user.id}
                                                            className="inline-flex items-center rounded bg-amber-600 px-3 py-1.5 text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {savingId === user.id ? 'Logging in...' : 'Login as'}
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(user)}
                                                        disabled={savingId === user.id || updatingProfile}
                                                        className="inline-flex items-center rounded bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        Edit
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

            <Modal show={showImportModal} onClose={closeImportModal} maxWidth="lg" closeable={!importing}>
                <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Import {importType === 'teachers' ? 'Teachers' : 'Students'}
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Upload a CSV with name and email columns. Last name, phone, and campus ID are optional.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={closeImportModal}
                            disabled={importing}
                            aria-label="Close import dialog"
                            className="rounded px-2 py-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                        >
                            Close
                        </button>
                    </div>

                    <div className="mt-6 flex flex-col gap-5">
                        <a
                            href={`/${importType === 'teachers' ? 'teacher' : 'student'}-import-template.csv`}
                            download
                            className="w-fit rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Download CSV Template
                        </a>

                        <form onSubmit={submitImport} className="space-y-3">
                            <InputLabel htmlFor={`${importType}-csv`} value={`${importType === 'teachers' ? 'Teacher' : 'Student'} CSV file`} />
                            <input
                                ref={fileInput}
                                id={`${importType}-csv`}
                                type="file"
                                accept=".csv,text/csv"
                                onChange={(event) => setImportData('file', event.target.files?.[0] || null)}
                                className="block w-full text-sm text-gray-700 file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
                                required
                            />
                            <InputError message={importErrors.file} />
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={importing}
                                    className="rounded bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {importing ? 'Importing...' : 'Upload and Import'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Modal>

            <Modal show={Boolean(editingUser)} onClose={closeEditModal} maxWidth="lg" closeable={!updatingProfile}>
                <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Edit User Profile</h2>
                            <p className="mt-1 text-sm text-gray-600">Update the user’s contact and campus information.</p>
                        </div>
                        <button
                            type="button"
                            onClick={closeEditModal}
                            disabled={updatingProfile}
                            aria-label="Close profile editor"
                            className="rounded px-2 py-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                        >
                            Close
                        </button>
                    </div>

                    <form onSubmit={submitEdit} className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="edit-name" value="First Name" />
                            <TextInput
                                id="edit-name"
                                value={editData.name}
                                className="mt-1 block w-full"
                                onChange={(event) => setEditData('name', event.target.value)}
                                required
                            />
                            <InputError message={editErrors.name} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="edit-lname" value="Last Name" />
                            <TextInput
                                id="edit-lname"
                                value={editData.lname}
                                className="mt-1 block w-full"
                                onChange={(event) => setEditData('lname', event.target.value)}
                            />
                            <InputError message={editErrors.lname} className="mt-2" />
                        </div>
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="edit-email" value="Email" />
                            <TextInput
                                id="edit-email"
                                type="email"
                                value={editData.email}
                                className="mt-1 block w-full"
                                onChange={(event) => setEditData('email', event.target.value)}
                                required
                            />
                            <InputError message={editErrors.email} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="edit-phone" value="Phone" />
                            <TextInput
                                id="edit-phone"
                                type="tel"
                                value={editData.phone}
                                className="mt-1 block w-full"
                                onChange={(event) => setEditData('phone', event.target.value)}
                            />
                            <InputError message={editErrors.phone} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="edit-campusID" value="Campus ID" />
                            <TextInput
                                id="edit-campusID"
                                value={editData.campusID}
                                className="mt-1 block w-full"
                                onChange={(event) => setEditData('campusID', event.target.value)}
                            />
                            <InputError message={editErrors.campusID} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="edit-role" value="Role" />
                            <select
                                id="edit-role"
                                value={editData.role}
                                onChange={(event) => setEditData('role', event.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                {roleOptions.map((role) => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                            <InputError message={editErrors.role} className="mt-2" />
                        </div>
                        <div className="flex justify-end gap-3 sm:col-span-2">
                            <button
                                type="button"
                                onClick={closeEditModal}
                                disabled={updatingProfile}
                                className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <PrimaryButton disabled={updatingProfile}>
                                {updatingProfile ? 'Saving...' : 'Save Changes'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
