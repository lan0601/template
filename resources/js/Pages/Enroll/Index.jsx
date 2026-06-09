import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Index() {
    const { students } = usePage().props;
    console.log(students);
    const { delete: destroy, processing } = useForm();
    // students.map((students) => {
    //     console.log(students);
    // });
    // const handleDelete = (enroll) => {
    //     console.log(enroll);
    //     if (!confirm(`Delete enroll ${enroll.user_id}?`)) {
    //         return;
    //     }

    //     destroy(route('enroll.destroy', enroll.id), {
    //         preserveScroll: true,
    //     });
    // };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Enroll Management
                </h2>
            }
        >
            <Head title="Enrolls" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                        <h3 className="text-lg font-medium text-gray-900">Enroll list</h3>
                        <Link
                            href={route('enroll.create')}
                            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-center rounded hover:bg-blue-700"
                        >
                            New Enroll
                        </Link>
                    </div>

                    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Student
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Subjects
                                        </th>
                                        {/* <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Status
                                        </th> */}
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {students.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500">
                                                No students found.
                                            </td>
                                        </tr>
                                    ) : (
                                        students.map((students) => (
                                            console.log(students),
                                            <tr key={students.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {students.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    
                                                    {students.enrolled_subjects.map((subject) => (
                                                        <span key={subject.id} className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full mr-2">
                                                            {subject.subject_code} - {subject.subject_name}
                                                        </span>
                                                    ))}
                                                </td>
                                                {/* <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                            students.status === 'available'
                                                                ? 'bg-green-100 text-green-800'
                                                                : students.status === 'occupied'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {students.status}
                                                    </span>
                                                </td> */}
                                                
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                    <Link
                                                        href={route('enroll.edit', students.id)}
                                                        className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                                    >
                                                        Edit
                                                    </Link>
                                                    {/* <button
                                                        type="button"
                                                        onClick={() => handleDelete(classroom)}
                                                        disabled={processing}
                                                        className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                                    >
                                                        Delete
                                                    </button> */}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
