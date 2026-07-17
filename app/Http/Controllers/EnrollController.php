<?php

namespace App\Http\Controllers;

use App\Models\Enroll;
use App\Models\Subject;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;

class EnrollController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $enrolls = Enroll::with(['student', 'subject'])->get();

        $users = User::where('role', 'student')
        ->with('enrollments.subject')
        ->get();
        // return $users;
        foreach ($users as $user) {
            $user->enrolled_subjects = $user->enrollments->map(function ($enrollment) {
                return $enrollment->subject;
            });
        }

        return Inertia::render('Enroll/Index', [
            'enrolls' => $enrolls,
            'students' => $users,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $users = User::select(['id', 'name', 'email'])->get();
        $subjects = Subject::select(['id', 'subject_name', 'subject_code'])->get();

        return Inertia::render('Enroll/Create', [
            'users' => $users,
            'subjects' => $subjects,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'subjects' => ['required', 'array', 'min:1'],
            'subjects.*' => ['required', 'exists:subjects,id'],
        ]);

        foreach ($request->input('subjects', []) as $subjectId) {
            Enroll::firstOrCreate([
                'user_id' => $request->input('user_id'),
                'subject_id' => $subjectId,
            ]);
        }

        return redirect()->route('enroll')->with('success', 'Enrollment saved successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Enroll $enroll)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $student)
    {
        $users = User::select(['id', 'name', 'email'])
        ->where('role', 'student')
        ->get();
        $subjects = Subject::select(['id', 'subject_name', 'subject_code'])->get();

        $student->load('enrollments.subject');
        $selectedSubjects = $student->enrollments->pluck('subject_id')->toArray();

        return Inertia::render('Enroll/Edit', [
            'student' => $student,
            'users' => $users,
            'subjects' => $subjects,
            'selectedSubjects' => $selectedSubjects,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $student)
    {
        $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'subjects' => ['required', 'array', 'min:1'],
            'subjects.*' => ['required', 'exists:subjects,id'],
        ]);

        $userId = (int) $request->input('user_id');
        $subjectIds = array_map('intval', (array) $request->input('subjects', []));

        if ($userId === (int) $student->id) {
            Enroll::where('user_id', $student->id)
                ->whereNotIn('subject_id', $subjectIds)
                ->delete();

            foreach ($subjectIds as $subjectId) {
                Enroll::firstOrCreate([
                    'user_id' => $student->id,
                    'subject_id' => $subjectId,
                ]);
            }
        } else {
            Enroll::where('user_id', $student->id)
                ->whereNotIn('subject_id', $subjectIds)
                ->delete();

            foreach ($subjectIds as $subjectId) {
                Enroll::firstOrCreate([
                    'user_id' => $userId,
                    'subject_id' => $subjectId,
                ]);
            }
        }

        return redirect()->route('enroll')->with('success', 'Enrollment updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Enroll $enroll)
    {
        //
    }
}
