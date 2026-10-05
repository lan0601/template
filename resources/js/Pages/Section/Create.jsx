import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, errors, processing } = useForm({
        section_name: '',
        course_id:'0',
        year_level:'',
        school_year:'',
        semester:'',
        status: 1,
    });
    
    const handleChange = (e) => {
        setData(e.target.name, e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('section.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Create Subject
                </h2>
            }
        >
            <Head title="Create Subject" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow sm:rounded-lg p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Subject Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Section Name
                                </label>
                                <input
                                    type="text"
                                    name="section_name"
                                    value={data.section_name}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    placeholder="e.g., A01-12 ABM-1"
                                />
                                {errors.section_name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.section_name}</p>
                                )}
                            </div>

                            {/* Year Level */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Year Level
                                </label>
                                <input
                                    type="text"
                                    name="year_level"
                                    value={data.year_level}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    placeholder="e.g., 12"
                                />
                                {errors.year_level && (
                                    <p className="mt-1 text-sm text-red-600">{errors.year_level}</p>
                                )}
                            </div>

                            {/* School Year */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    School Year
                                </label>
                                <input
                                    type="text"
                                    name="school_year"
                                    value={data.school_year}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    placeholder="e.g., 2020"
                                />
                                {errors.school_year && (
                                    <p className="mt-1 text-sm text-red-600">{errors.school_year}</p>
                                )}
                            </div>

                            {/* Semester */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Semester
                                </label>
                                <input
                                    type="number"
                                    name="semester"
                                    value={data.semester}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    placeholder="e.g., 1"
                                />
                                {errors.semester && (
                                    <p className="mt-1 text-sm text-red-600">{errors.semester}</p>
                                )}
                            </div>

                            {/* Status
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
                            </div> */}

                            {/* Buttons */}
                            <div className="flex justify-end space-x-3">
                                <Link
                                    href={route('section')}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {processing ? 'Creating...' : 'Create Section'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
