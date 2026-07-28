import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import SearchableSelect from '@/Components/SearchableSelect';

export default function Edit() {
    const { enrollment, users, sections } = usePage().props;

    const { data, setData, patch, errors, processing } = useForm({
        user_id:     String(enrollment.user_id),
        section_id:  String(enrollment.section_id),
        school_year: enrollment.school_year ?? '',
        status:      enrollment.status ?? 'active',
    });

    // Map users to { value, label } options
    const studentOptions = users.map((u) => ({
        value: u.id,
        label: `${u.name}${u.lname ? ' ' + u.lname : ''}${u.email ? ' (' + u.email + ')' : ''}`,
    }));

    // Map sections to { value, label } options
    const sectionOptions = sections.map((s) => ({
        value: s.id,
        label: `${s.section_name} — ${s.year_level} | ${s.school_year} ${s.semester}`,
    }));

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('enroll.update', enrollment.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit Enrollment
                </h2>
            }
        >
            <Head title="Edit Enrollment" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow sm:rounded-lg p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Student */}
                            <div>
                                <label htmlFor="user_id" className="block text-sm font-medium text-gray-700">
                                    Student <span className="text-red-500">*</span>
                                </label>
                                <SearchableSelect
                                    id="user_id"
                                    value={data.user_id}
                                    onChange={(val) => setData('user_id', val)}
                                    options={studentOptions}
                                    placeholder="Search student by name or email…"
                                    error={errors.user_id}
                                />
                            </div>

                            {/* Section */}
                            <div>
                                <label htmlFor="section_id" className="block text-sm font-medium text-gray-700">
                                    Section <span className="text-red-500">*</span>
                                </label>
                                <SearchableSelect
                                    id="section_id"
                                    value={data.section_id}
                                    onChange={(val) => setData('section_id', val)}
                                    options={sectionOptions}
                                    placeholder="Search section by name…"
                                    error={errors.section_id}
                                />
                            </div>

                            {/* School Year */}
                            <div>
                                <label htmlFor="school_year" className="block text-sm font-medium text-gray-700">
                                    School Year <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="school_year"
                                    type="text"
                                    name="school_year"
                                    value={data.school_year}
                                    onChange={(e) => setData('school_year', e.target.value)}
                                    placeholder="e.g. 2025-2026"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 text-sm text-gray-700"
                                />
                                {errors.school_year && (
                                    <p className="mt-1 text-sm text-red-600">{errors.school_year}</p>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 text-sm text-gray-700"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="dropped">Dropped</option>
                                </select>
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end space-x-3">
                                <Link
                                    href={route('enroll')}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
