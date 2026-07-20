import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ section }) {
    console.log(section)
    const { data, setData, patch, errors, processing } = useForm({
        section_name: section.section_name,
        course_id: section.course_id || '',
        year_level: section.year_level,
        school_year: section.school_year,
        semester: section.semester,
        status: section.status,
    });

    const handleChange = (e) => {
        setData(e.target.name, e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('section.update', section.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit Section
                </h2>
            }
        >
            <Head title="Edit Section" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow sm:rounded-lg p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                />
                                {errors.section_name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.section_name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Year Level
                                </label>
                                <input
                                    type="number"
                                    name="year_level"
                                    value={data.year_level}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                />
                                {errors.year_level && (
                                    <p className="mt-1 text-sm text-red-600">{errors.year_level}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    School Year
                                </label>
                                <input
                                    type="number"
                                    name="school_year"
                                    value={data.school_year}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                />
                                {errors.school_year && (
                                    <p className="mt-1 text-sm text-red-600">{errors.school_year}</p>
                                )}
                            </div>

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
                                />
                                {errors.semester && (
                                    <p className="mt-1 text-sm text-red-600">{errors.semester}</p>
                                )}
                            </div>

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
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                    {/* <option value="2">Maintenance</option> */}
                                </select>
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                )}
                            </div>

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
                                    {processing ? 'Updating...' : 'Update Section'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
