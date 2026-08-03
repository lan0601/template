import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Edit() {
    const { enrollmentSubject } = usePage().props;
    const { data, setData, patch, errors, processing } = useForm({
        status: (enrollmentSubject.status || 'enrolled').toLowerCase(),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('enrollmentsubject.update', enrollmentSubject.id));
    };

    const studentName = enrollmentSubject.enrollment?.student
        ? `${enrollmentSubject.enrollment.student.name} ${enrollmentSubject.enrollment.student.lname || ''}`.trim()
        : 'N/A';

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit Enrollment Subject
                </h2>
            }
        >
            <Head title="Edit Enrollment Subject" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow sm:rounded-lg p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Student</label>
                                    <div className="mt-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                        {studentName}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                                    <div className="mt-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                        {enrollmentSubject.subject_offering?.subject?.subject_name || 'N/A'} (
                                            {enrollmentSubject.subject_offering?.subject?.subject_code || ''}
                                        )
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Teacher</label>
                                    <div className="mt-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                        {enrollmentSubject.subject_offering?.teacher
                                            ? `${enrollmentSubject.subject_offering.teacher.name} ${enrollmentSubject.subject_offering.teacher.lname || ''}`.trim()
                                            : 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Classroom</label>
                                    <div className="mt-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                        {enrollmentSubject.subject_offering?.classroom?.room_number || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                    Enrollment Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="enrolled">Enrolled</option>
                                    <option value="dropped">Dropped</option>
                                    <option value="completed">Completed</option>
                                    <option value="incomplete">Incomplete</option>
                                </select>
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3">
                                <Link
                                    href={route('enrollmentsubject')}
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
