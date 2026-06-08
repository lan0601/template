import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ subject }) {
    const { data, setData, patch, errors, processing } = useForm({
        subject_code: subject.subject_code,
        subject_name: subject.subject_name,
        units: subject.units,
        status: subject.status,
    });

    const handleChange = (e) => {
        setData(e.target.name, e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('subject.update', subject.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit subject
                </h2>
            }
        >
            <Head title="Edit subject" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow sm:rounded-lg p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Subject Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Subject Code
                                </label>
                                <input
                                    type="text"
                                    name="subject_code"
                                    value={data.subject_code}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    placeholder="e.g., LAB101"
                                />
                                {errors.subject_code && (
                                    <p className="mt-1 text-sm text-red-600">{errors.subject_code}</p>
                                )}
                            </div>

                            {/* Subject Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Subject Name
                                </label>
                                <input
                                    type="text"
                                    name="subject_name"
                                    value={data.subject_name}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    placeholder="e.g., Introduction to Programming"
                                />
                                {errors.subject_name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.subject_name}</p>
                                )}
                            </div>

                            {/* Units */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Units
                                </label>
                                <input
                                    type="number"
                                    name="units"
                                    value={data.units}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    placeholder="e.g., 3"
                                />
                                {errors.units && (
                                    <p className="mt-1 text-sm text-red-600">{errors.units}</p>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={data.status}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                >
                                    <option value="available">Available</option>
                                    <option value="occupied">Occupied</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end space-x-3">
                                <Link
                                    href={route('subject')}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {processing ? 'Updating...' : 'Update subject'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
