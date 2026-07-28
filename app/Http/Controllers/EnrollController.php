<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\Section;
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
        $enrollments = Enrollment::with(['student', 'section'])->latest()->get();

        return Inertia::render('Enroll/Index', [
            'enrollments' => $enrollments,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $users = User::select(['id', 'name', 'lname', 'email'])
            ->where('role', 'Student')
            ->get();

        $sections = Section::select(['id', 'section_name', 'year_level', 'school_year', 'semester'])
            ->where('status', 1)
            ->orderBy('section_name')
            ->get();

        return Inertia::render('Enroll/Create', [
            'users'    => $users,
            'sections' => $sections,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id'     => ['required', 'exists:users,id'],
            'section_id'  => ['required', 'exists:sections,id'],
            'school_year' => ['required', 'string', 'max:20'],
            'status'      => ['required', 'in:active,inactive,dropped'],
        ]);

        // Prevent duplicate enrollment in the same section & school year
        $exists = Enrollment::where('user_id', $validated['user_id'])
            ->where('section_id', $validated['section_id'])
            ->where('school_year', $validated['school_year'])
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'user_id' => 'This student is already enrolled in that section for the given school year.',
            ]);
        }

        Enrollment::create($validated);

        return redirect()->route('enroll')->with('success', 'Enrollment created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Enrollment $enrollment)
    {
        $users = User::select(['id', 'name', 'lname', 'email'])
            ->where('role', 'Student')
            ->get();

        $sections = Section::select(['id', 'section_name', 'year_level', 'school_year', 'semester'])
            ->where('status', 1)
            ->orderBy('section_name')
            ->get();

        return Inertia::render('Enroll/Edit', [
            'enrollment' => $enrollment,
            'users'      => $users,
            'sections'   => $sections,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Enrollment $enrollment)
    {
        $validated = $request->validate([
            'user_id'     => ['required', 'exists:users,id'],
            'section_id'  => ['required', 'exists:sections,id'],
            'school_year' => ['required', 'string', 'max:20'],
            'status'      => ['required', 'in:active,inactive,dropped'],
        ]);

        // Prevent duplicate (excluding the current record)
        $exists = Enrollment::where('user_id', $validated['user_id'])
            ->where('section_id', $validated['section_id'])
            ->where('school_year', $validated['school_year'])
            ->where('id', '!=', $enrollment->id)
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'user_id' => 'This student is already enrolled in that section for the given school year.',
            ]);
        }

        $enrollment->update($validated);

        return redirect()->route('enroll')->with('success', 'Enrollment updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Enrollment $enrollment)
    {
        $enrollment->delete();

        return redirect()->route('enroll')->with('success', 'Enrollment deleted successfully.');
    }
}
