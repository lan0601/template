import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function UserForm({ user, roles, onCancel }) {
    const editing = Boolean(user);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: user?.name ?? '',
        lname: user?.lname ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
        campusID: user?.campusID ?? '',
        userroleid: user?.userroleid ?? roles[0]?.id ?? '',
        password: '',
        password_confirmation: '',
        remove: Boolean(user?.remove),
    });

    useEffect(() => () => reset('password', 'password_confirmation'), []);

    const submit = (event) => {
        event.preventDefault();
        const options = { onSuccess: onCancel };
        editing ? put(route('admin.users.update', user.id), options) : post(route('admin.users.store'), options);
    };

    const field = (name, label, type = 'text') => (
        <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
            <input type={type} value={data[name]} onChange={(e) => setData(name, e.target.value)} className="mt-1 w-full rounded-md border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900" />
            {errors[name] && <span className="mt-1 block text-sm text-red-600">{errors[name]}</span>}
        </label>
    );

    return (
        <form onSubmit={submit} className="mb-6 rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{editing ? 'Edit user' : 'Add user'}</h2>
                <button type="button" onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white">Cancel</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                {field('name', 'First name')}
                {field('lname', 'Last name')}
                {field('email', 'Email', 'email')}
                {field('phone', 'Phone')}
                {field('campusID', 'Campus ID')}
                <label className="block"><span className="text-sm font-medium text-slate-700 dark:text-slate-200">Role</span><select value={data.userroleid} onChange={(e) => setData('userroleid', e.target.value)} className="mt-1 w-full rounded-md border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"><option value="" disabled>Select a role</option>
                {roles.map((role) => 
                <option key={role.id} value={role.id}>{role.role_name}</option>)}
            </select>{errors.userroleid && <span className="mt-1 block text-sm text-red-600">{errors.userroleid}</span>}</label>
                {field('password', editing ? 'New password (optional)' : 'Password', 'password')}
                {field('password_confirmation', 'Confirm password', 'password')}
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={data.remove} onChange={(e) => setData('remove', e.target.checked)} /> Mark account as removed</label>
            <button disabled={processing} className="mt-5 rounded-md bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-50">{editing ? 'Save changes' : 'Create user'}</button>
        </form>
    );
}

export default function Users({ users, roles = [], user = null }) {
    const [showForm, setShowForm] = useState(Boolean(user));
    const { flash } = usePage().props;
    const rows = users?.data ?? users ?? [];
    console.log(users);
    useEffect(() => setShowForm(Boolean(user)), [user]);

    const destroy = (id) => {
        if (window.confirm('Delete this user?')) router.delete(route('admin.users.destroy', id));
    };

    return <AuthenticatedLayout>
        <Head title="Users" />
            <div className="mx-auto max-w-7xl"><div className="mb-6 flex items-center justify-between"><div><p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Admin</p><h1 className="text-2xl font-bold">Users</h1></div><button onClick={() => setShowForm(true)} className="rounded-md bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800">Add user</button></div>{flash?.success && <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">{flash.success}</div>}{showForm && <UserForm user={user} roles={roles} onCancel={() => { setShowForm(false); if (user) router.get(route('admin.users.index')); }} />}<div className="overflow-x-auto rounded-lg bg-white shadow-sm dark:bg-slate-900">
                <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-700">
                        <tr>
                            <th className="px-5 py-3">Name</th>
                            <th className="px-5 py-3">Email</th>
                            <th className="px-5 py-3">Role</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((item) => (
                            <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800">
                                <td className="px-5 py-4 font-medium">{item.name} {item.lname}</td>
                                <td className="px-5 py-4">{item.email}</td>
                                <td className="px-5 py-4 capitalize">{item.user_role?.role_name ?? 'Unassigned'}</td>
                                <td className="px-5 py-4">{item.remove ? 'Removed' : 'Active'}</td>
                                <td className="px-5 py-4 text-right">
                                    <Link href={route('admin.users.edit', item.id)} className="mr-3 text-blue-700 hover:underline">
                                        Edit
                                    </Link>
                                    <button onClick={() => destroy(item.id)} className="text-red-700 hover:underline">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!rows.length && (
                            <tr>
                                <td colSpan="5" className="px-5 py-8 text-center text-slate-500">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </AuthenticatedLayout>;
}
