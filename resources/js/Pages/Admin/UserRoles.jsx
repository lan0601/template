import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

function RoleForm({ role, modules, onCancel }) {
    const editing = Boolean(role);
    const { data, setData, post, put, processing, errors } = useForm({
        role_name: role?.role_name ?? "",
        permissions: Object.keys(modules).reduce(
            (result, module) => ({
                ...result,
                [module]: Boolean(role?.permissions?.[module]),
            }),
            {},
        ),
    });

    const submit = (event) => {
        event.preventDefault();
        const options = { onSuccess: onCancel };
        editing
            ? put(route("admin.user-roles.update", role.id), options)
            : post(route("admin.user-roles.store"), options);
    };

    return (
        <form
            onSubmit={submit}
            className="mb-6 rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900"
        >
            <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                    {editing ? "Edit user role" : "Add user role"}
                </h2>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                    Cancel
                </button>
            </div>
            <label className="block max-w-md">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Role name
                </span>
                <input
                    value={data.role_name}
                    onChange={(event) =>
                        setData("role_name", event.target.value.toLowerCase())
                    }
                    className="mt-1 w-full rounded-md border-slate-300 bg-white lowercase shadow-sm dark:border-slate-700 dark:bg-slate-900"
                    placeholder="e.g. manager"
                />
                {errors.role_name && (
                    <span className="mt-1 block text-sm text-red-600">
                        {errors.role_name}
                    </span>
                )}
            </label>
            <fieldset className="mt-5">
                <legend className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Module permissions
                </legend>
                <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(modules).map(([module, label]) => (
                        <label
                            key={module}
                            className="flex items-center gap-2 rounded-md border border-slate-200 p-3 text-sm dark:border-slate-700"
                        >
                            <input
                                type="checkbox"
                                checked={Boolean(data.permissions[module])}
                                onChange={(event) =>
                                    setData("permissions", {
                                        ...data.permissions,
                                        [module]: event.target.checked,
                                    })
                                }
                            />
                            {label}
                        </label>
                    ))}
                </div>
            </fieldset>
            <button
                disabled={processing}
                className="mt-5 rounded-md bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            >
                {editing ? "Save changes" : "Create role"}
            </button>
        </form>
    );
}

export default function UserRoles({ roles = [], modules, role = null }) {
    const [showForm, setShowForm] = useState(Boolean(role));
    const { flash } = usePage().props;
                    console.log(modules,role)

    useEffect(() => setShowForm(Boolean(role)), [role]);

    const destroy = (id) => {
        if (window.confirm("Delete this user role?"))
            router.delete(route("admin.user-roles.destroy", id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="User Roles" />
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                            Admin
                        </p>
                        <h1 className="text-2xl font-bold">User Roles</h1>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="rounded-md bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800"
                    >
                        Add role
                    </button>
                </div>
                {flash?.success && (
                    <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
                        {flash.success}
                    </div>
                )}
                
                {showForm && (
                    <RoleForm
                        role={role}
                        modules={modules}
                        onCancel={() => {
                            setShowForm(false);
                            if (role)
                                router.get(route("admin.user-roles.index"));
                        }}
                    />
                )}
                <div className="overflow-x-auto rounded-lg bg-white shadow-sm dark:bg-slate-900">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-700">
                            <tr>
                                <th className="px-5 py-3">Role</th>
                                <th className="px-5 py-3">Modules</th>
                                <th className="px-5 py-3">Assigned users</th>
                                <th className="px-5 py-3 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-slate-100 dark:border-slate-800"
                                >
                                    <td className="px-5 py-4 font-medium lowercase">
                                        {item.role_name.toLowerCase()}
                                    </td>
                                    <td className="px-5 py-4">
                                        {
                                            Object.keys(
                                                item.permissions ?? {},
                                            ).filter(
                                                (module) =>
                                                    item.permissions[module],
                                            ).length
                                        }
                                    </td>
                                    <td className="px-5 py-4">
                                        {item.users_count}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <Link
                                            href={route(
                                                "admin.user-roles.edit",
                                                item.id,
                                            )}
                                            className="mr-3 text-blue-700 hover:underline"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => destroy(item.id)}
                                            className="text-red-700 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!roles.length && (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-5 py-8 text-center text-slate-500"
                                    >
                                        No user roles found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
