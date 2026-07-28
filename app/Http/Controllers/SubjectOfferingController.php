<?php

namespace App\Http\Controllers;

use App\Models\SubjectOffering;
use App\Models\Subject;
use App\Models\User;
use App\Models\Classroom;
use App\Models\Section;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class SubjectOfferingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $subjectOfferings = SubjectOffering::with(['subject', 'teacher', 'classroom'])
            ->latest()
            ->get()
            ->map(function ($offering) {
                $offering->start_time = Carbon::parse($offering->start_time)->format('H:i');
                $offering->end_time = Carbon::parse($offering->end_time)->format('H:i');

                return $offering;
            });

        return Inertia::render('Subjectoffer/Index', [
            'subjectofferings' => $subjectOfferings,
        ]);


        // $subjectOfferings = SubjectOffering::with(['subject', 'teacher', 'classroom'])->latest()->get();
        // // dd($subjectOfferings);
        // return Inertia::render('Subjectoffer/Index', [
        //     'subjectofferings' => $subjectOfferings,
        // ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Subjectoffer/Create', [
            'subjects' => Subject::all(),
            'teachers' => User::where('role', 'teacher')->where('userroleid',3)->get(),
            'classrooms' => Classroom::all(),
            'sections' => Section::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:users,id',
            'classroom_id' => 'required|exists:classrooms,id',
            'section' => 'required|string|max:255',
            'term' => 'required|integer|in:1,2,3,4',
            'school_year' => 'required|string|max:255',
            'semester' => 'required|string|max:255',
            'day' => 'required|string|max:255',
            'start_time' => 'required',
            'end_time' => 'required',
            'capacity' => 'required|integer|min:1',
            'status' => 'required|integer',
        ]);

        SubjectOffering::create($validated);

        return redirect(route('subjectoffering'))->with('message', 'Subject Offering created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(SubjectOffering $subjectOffering)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(SubjectOffering $subjectoffering)
    {
        return Inertia::render('Subjectoffer/Edit', [
            'subjectOffering' => $subjectoffering->load(['subject', 'teacher', 'classroom']),
            'subjects' => Subject::all(),
            'teachers' => User::all(),
            'classrooms' => Classroom::all(),
            'sections' => Section::all(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SubjectOffering $subjectoffering)
    {
        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:users,id',
            'classroom_id' => 'required|exists:classrooms,id',
            'section' => 'required|string|max:255',
            'term' => 'required|integer|in:1,2,3,4',
            'school_year' => 'required|string|max:255',
            'semester' => 'required|string|max:255',
            'day' => 'required|string|max:255',
            'start_time' => 'required',
            'end_time' => 'required',
            'capacity' => 'required|integer|min:1',
            'status' => 'required|integer',
        ]);

        $subjectoffering->update($validated);

        return redirect(route('subjectoffering'))->with('message', 'Subject Offering updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SubjectOffering $subjectOffering)
    {
        $subjectOffering->delete();

        return redirect(route('subject_offering'))->with('message', 'Subject Offering deleted successfully.');
    }
}
