import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ classroom }) {
    const { data, setData, patch, errors, processing } = useForm({
        room_name: classroom.room_name,
        room_number: classroom.room_number,
        building: classroom.building,
        capacity: classroom.capacity,
        status: classroom.status,
    });

    const handleChange = (e) => {
        setData(e.target.name, e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('classroom.update', classroom.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit Classroom
                </h2>
            }
        >
            <Head title="Edit Classroom" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow sm:rounded-lg p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Room Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Room Name
                                </label>
                                <input
                                    type="text"
                                    name="room_name"
                                    value={data.room_name}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    placeholder="e.g., Laboratory A"
                                />
                                {errors.room_name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.room_name}</p>
                                )}
                            </div>

                            {/* Room Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Room Number
                                </label>
                                <input
                                    type="text"
                                    name="room_number"
                                    value={data.room_number}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    placeholder="e.g., 101"
                                />
                                {errors.room_number && (
                                    <p className="mt-1 text-sm text-red-600">{errors.room_number}</p>
                                )}
                            </div>

                            {/* Building */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Building
                                </label>
                                <input
                                    type="text"
                                    name="building"
                                    value={data.building}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    placeholder="e.g., Building A"
                                />
                                {errors.building && (
                                    <p className="mt-1 text-sm text-red-600">{errors.building}</p>
                                )}
                            </div>

                            {/* Capacity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Capacity
                                </label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={data.capacity}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    placeholder="e.g., 50"
                                />
                                {errors.capacity && (
                                    <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
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
                                    href={route('classroom')}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {processing ? 'Updating...' : 'Update Classroom'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
