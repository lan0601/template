import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Fragment, useState } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

export default function Index({ auth }) {
    const { enrollmentSubjects, flash } = usePage().props;
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState(null);
    const [expandedStudentId, setExpandedStudentId] = useState(null);

    const confirmDeletion = (enrollmentSubject) => {
        setSubjectToDelete(enrollmentSubject);
        setConfirmingDeletion(true);
    };

    const toggleStudentDetails = (studentId) => {
        setExpandedStudentId((current) => (current === studentId ? null : studentId));
    };

    const students = enrollmentSubjects.reduce((acc, item) => {
        const studentId = item.enrollment?.student?.id;
        if (!studentId) {
            return acc;
        }

        if (!acc[studentId]) {
            acc[studentId] = {
                id: studentId,
                name: `${item.enrollment.student.name} ${item.enrollment.student.lname || ''}`.trim(),
                email: item.enrollment.student.email || '',
                subjects: [],
            };
        }

        acc[studentId].subjects.push(item);
        return acc;
    }, {});

    const studentList = Object.values(students);

    const closeModal = () => {
        setConfirmingDeletion(false);
        setSubjectToDelete(null);
    };

    const deleteSubject = (e) => {
        e.preventDefault();
        if (subjectToDelete) {
            router.delete(route('enrollmentsubject.destroy', subjectToDelete.id), {
                onSuccess: () => closeModal(),
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Enrollment Subject Lists
                </h2>
            }
        >
            <Head title="Enrolled Subjects" />

            <div className="pb-12">
                <div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                        <h3 className="text-lg font-medium text-gray-900">Enrolled Subjects</h3>
                        <Link
                            href={route('enrollmentsubject.create')}
                            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-center rounded hover:bg-blue-700 font-medium transition"
                        >
                            + New Enroll Student
                        </Link>
                    </div>

                    <div className="overflow-hidden bg-white shadow sm:rounded-lg border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Student
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Enrolled Subjects
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {studentList.length > 0 ? (
                                        studentList.map((student) => (
                                            <Fragment key={student.id}>
                                                <tr className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {student.name || 'N/A'}
                                                        <div className="text-xs text-gray-400">
                                                            {student.email || ''}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                                            {student.subjects.length} subject{student.subjects.length === 1 ? '' : 's'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleStudentDetails(student.id)}
                                                            className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                                                        >
                                                            {expandedStudentId === student.id ? 'Hide' : 'View'}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {expandedStudentId === student.id && (
                                                    <tr>
                                                        <td colSpan="3" className="px-6 py-4 bg-gray-50">
                                                            <div className="overflow-hidden rounded-lg border border-gray-200">
                                                                <table className="min-w-full divide-y divide-gray-200">
                                                                    <thead className="bg-gray-100">
                                                                        <tr>
                                                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Subject</th>
                                                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Teacher</th>
                                                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Classroom</th>
                                                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                                                                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                                        {student.subjects.map((subject) => (
                                                                            <tr key={subject.id} className="hover:bg-gray-50">
                                                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                                                    {subject.subject_offering?.subject?.subject_name || 'N/A'}
                                                                                    <div className="text-xs text-gray-400">{subject.subject_offering?.subject?.subject_code || ''}</div>
                                                                                </td>
                                                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                                                    {subject.subject_offering?.teacher ? `${subject.subject_offering.teacher.name} ${subject.subject_offering.teacher.lname || ''}`.trim() : 'N/A'}
                                                                                </td>
                                                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                                                    {subject.subject_offering?.classroom?.room_number || 'N/A'}
                                                                                </td>
                                                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                                                    {subject.status === 'enrolled' ? (
                                                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Enrolled</span>
                                                                                    ) : subject.status === 'dropped' ? (
                                                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Dropped</span>
                                                                                    ) : (
                                                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{subject.status}</span>
                                                                                    )}
                                                                                </td>
                                                                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                                                    <Link
                                                                                        href={route('enrollmentsubject.edit', subject.id)}
                                                                                        className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                                                                                    >
                                                                                        Edit
                                                                                    </Link>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => confirmDeletion(subject)}
                                                                                        className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                                                                    >
                                                                                        Delete
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">No enrolled subjects found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            {/* <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classroom</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {enrollmentSubjects.length > 0 ? (
                                            enrollmentSubjects.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {item.enrollment?.student ? `${item.enrollment.student.name} ${item.enrollment.student.lname || ''}`.trim() : 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.subject_offering?.subject?.subject_name || 'N/A'}
                                                        <div className="text-xs text-gray-400">{item.subject_offering?.subject?.subject_code || ''}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.subject_offering?.teacher ? `${item.subject_offering.teacher.name} ${item.subject_offering.teacher.lname || ''}`.trim() : 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.subject_offering?.classroom?.room_number || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'enrolled' ? 'bg-green-100 text-green-800' : item.status === 'dropped' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                        <Link href={route('enrollmentsubject.edit', item.id)} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                                                        <button onClick={() => confirmDeletion(item)} className="text-red-600 hover:text-red-900">Delete</button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">No enrolled subjects found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div> */}

            <Modal show={confirmingDeletion} onClose={closeModal}>
                <form onSubmit={deleteSubject} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Are you sure you want to delete this enrollment record?</h2>
                    <p className="mt-1 text-sm text-gray-600">This action cannot be undone.</p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                        <DangerButton className="ms-3">Delete Record</DangerButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
