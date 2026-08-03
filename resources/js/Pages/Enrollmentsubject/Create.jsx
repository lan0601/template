import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import SearchableSelect from '@/Components/SearchableSelect';

export default function Create() {
    const { users, subjectOfferings } = usePage().props;
    const { data, setData, post, errors, processing } = useForm({
        user_id: '',
        subject_offering_ids: [], // Array to hold selected subject offering IDs
    });

    // Map users to { value, label } options
    const studentOptions = users.map((u) => ({
        value: u.id,
        label: `${u.name}${u.lname ? ' ' + u.lname : ''}${u.email ? ' (' + u.email + ')' : ''}`,
    }));
    
    // Handle checkbox changes for subject offerings
    const handleSubjectChange = (e) => {
        const subjectId = parseInt(e.target.value, 10);
        let updatedIds = [...data.subject_offering_ids];

        if (e.target.checked) {
            if (!updatedIds.includes(subjectId)) {
                updatedIds.push(subjectId);
            }
        } else {
            updatedIds = updatedIds.filter((id) => id !== subjectId);
        }
        setData('subject_offering_ids', updatedIds);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('enrollmentsubject.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Enroll Student in Subjects
                </h2>
            }
        >
            <Head title="Enroll Student in Subjects" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
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
                                {errors.user_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.user_id}</p>
                                )}
                            </div>

                            {/* Subject Offerings Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Available Subjects <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-200 rounded-md p-4 max-h-96 overflow-y-auto">
                                    {subjectOfferings.length > 0 ? (
                                        subjectOfferings.map((offering) => (
                                            <label key={offering.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-md hover:bg-gray-100 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    value={offering.id}
                                                    checked={data.subject_offering_ids.includes(offering.id)}
                                                    onChange={handleSubjectChange}
                                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-sm text-gray-800">
                                                    <strong>{offering.subject.subject_name}</strong> ({offering.subject.subject_code})
                                                    <br />
                                                    <span className="text-xs text-gray-600">
                                                        {offering.section.section_name} | {offering.school_year} {offering.semester}
                                                    </span>
                                                </span>
                                            </label>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 col-span-full">No subject offerings available.</p>
                                    )}
                                </div>
                                {errors.subject_offering_ids && (
                                    <p className="mt-1 text-sm text-red-600">{errors.subject_offering_ids}</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end space-x-3">
                                <Link
                                    href={route('enrollmentsubject')}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing || data.subject_offering_ids.length === 0 || !data.user_id}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {processing ? 'Enrolling...' : 'Enroll Student'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
