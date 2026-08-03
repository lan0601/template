<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\EnrollmentSubject;
use App\Models\SubjectOffering;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class EnrollmentSubjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // $enrollmentSubjects = EnrollmentSubject::with([
        //     'student:id,name,lname,email',
        //     'subjectOffering.subject:id,subject_code,subject_name',
        //     'subjectOffering.section:id,section_name,school_year,semester'
        // ])->latest()->get();
        // Note: You will need to create an Index.jsx component to display this data.

        $enrollmentSubjects = EnrollmentSubject::with([
            'enrollment.student',
            'subjectOffering.subject',
            'subjectOffering.teacher',
             'subjectOffering.classroom',])
        ->where('remove', 0) // Only fetch records that are not "removed"
        ->latest()
        ->get();
        // dd($enrollmentSubjects);
        return Inertia::render('Enrollmentsubject/Index', [
            'enrollmentSubjects' => $enrollmentSubjects,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Fetch users with the 'Student' role for the dropdown
        $users = User::select(['id', 'name', 'lname', 'email'])
            ->where('role', 'Student')
            ->orderBy('name')
            ->get();

        // Fetch all available subject offerings, eager-loading related subject and section data
        $subjectOfferings = SubjectOffering::with(['subject'])
            ->where('remove',0)
            ->get();
        return Inertia::render('Enrollmentsubject/Create', [
            'users'            => $users,
            'subjectOfferings' => $subjectOfferings,
        ]);
        
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'subject_offering_ids'   => ['required', 'array', 'min:1'],
            'subject_offering_ids.*' => ['required', 'exists:subject_offerings,id'],
        ]);


        $studentId = $validated['user_id'];
        $subjectOfferingIds = $validated['subject_offering_ids'];

        // Find the latest active enrollment record for the student.
        $enrollment = Enrollment::where('user_id', $studentId)
            ->where('status', 'active') // Assuming 'active' is the status for current enrollments
            ->latest('id') // Get the most recent enrollment record
            ->first();

        // If no active enrollment is found, redirect back with an error.
        if (!$enrollment) {
            return Redirect::back()
                ->withErrors(['user_id' => 'No active enrollment found for this student. Please enroll the student in a section first.'])
                ->withInput();
        }

        $enrollmentId = $enrollment->id;

        $enrollmentsToCreate = [];
        foreach ($subjectOfferingIds as $subjectOfferingId) {
            // Check to prevent enrolling a student in the same subject offering for the same enrollment period
            $alreadyEnrolled = EnrollmentSubject::where('enrollment_id', $enrollmentId)
                ->where('subject_offering_id', $subjectOfferingId)
                ->exists();
            if (!$alreadyEnrolled) {
                $enrollmentsToCreate[] = [
                    'enrollment_id'       => $enrollmentId,
                    'subject_offering_id' => $subjectOfferingId,
                    'status' => 'enrolled', // Default status
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }
        // Use a bulk insert for better performance if there are new enrollments
        if (!empty($enrollmentsToCreate)) {
            EnrollmentSubject::insert($enrollmentsToCreate);
        }else{
            return Redirect::back()
                ->withErrors(['subject_offering_ids' => 'The student is already enrolled in the selected subject offerings.'])
                ->withInput();
        }

        return Redirect::route('enrollmentsubject')->with('success', 'Student enrolled successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(EnrollmentSubject $enrollment_subject)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EnrollmentSubject $enrollment_subject)
    {
        // Load related data for the edit form
        $enrollment_subject->load([
            'enrollment.student:id,name,lname,email',
            'subjectOffering.subject',
            'subjectOffering.teacher',
            'subjectOffering.classroom'
        ]);

        // Note: You will need to create an Edit.jsx component for this.
        return Inertia::render('Enrollmentsubject/Edit', [
            'enrollmentSubject' => $enrollment_subject,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, EnrollmentSubject $enrollment_subject)
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:enrolled,dropped,completed,incomplete'],
        ]);

        $enrollment_subject->update($validated);

        return Redirect::route('enrollmentsubject')->with('success', 'Enrollment status updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EnrollmentSubject $enrollment_subject)
    {
        // Update the 'remove' flag to 1 instead of deleting the record
        $enrollment_subject->update(['remove' => 1]);

        return Redirect::route('enrollmentsubject')->with('success', 'Enrollment record removed successfully.');
    }
}
