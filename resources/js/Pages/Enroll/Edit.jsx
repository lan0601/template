import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Edit() {
    const { student, users, subjects, selectedSubjects } = usePage().props;
    const { data, setData, patch, errors, processing } = useForm({
        user_id: student.id,
        subjects: selectedSubjects,
    });

    const handleUserChange = (e) => {
        setData('user_id', e.target.value);
    };

    const handleSubjectChange = (e) => {
        const subjectId = parseInt(e.target.value, 10);
        if (e.target.checked) {
            setData('subjects', [...data.subjects, subjectId]);
        } else {
            setData('subjects', data.subjects.filter((id) => id !== subjectId));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('enroll.update', student.id));
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Student
                                </label>
                                <select
                                    name="user_id"
                                    value={data.user_id}
                                    onChange={handleUserChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                >
                                    <option value="">Select a student</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} {user.email ? `(${user.email})` : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.user_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.user_id}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Subjects
                                </label>
                                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                                    {subjects.map((subject) => (
                                        <label
                                            key={subject.id}
                                            className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-3 hover:border-blue-500"
                                        >
                                            <input
                                                type="checkbox"
                                                name="subjects[]"
                                                value={subject.id}
                                                checked={data.subjects.includes(subject.id)}
                                                onChange={handleSubjectChange}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-3 text-sm text-gray-700">
                                                {subject.subject_name} {subject.subject_code ? `(${subject.subject_code})` : ''}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {errors.subjects && (
                                    <p className="mt-1 text-sm text-red-600">{errors.subjects}</p>
                                )}
                            </div>

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
                                    {processing ? 'Saving...' : 'Save Enrollment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
