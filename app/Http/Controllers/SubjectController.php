<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;


class SubjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $subjects = Subject::all();

        return Inertia::render('Subject/Index', [
            'subjects' => $subjects,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Subject/Create'); 
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject_code' => 'required|string|max:255|unique:subjects',
            'subject_name' => 'required|string|max:255',
            'units' => 'required|integer|min:1',
            'status' => 'required|in:available,occupied,maintenance',
        ]);
        Subject::create($validated);
        return redirect(route('subject'))->with('message', 'Subject created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Subject $subject)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Subject $subject)
    {
        return Inertia::render('Subject/Edit', [
            'subject' => $subject,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Subject $subject)
    {
         $validated = $request->validate([
            'subject_code' => 'required|string|max:255|unique:subjects,subject_code,' . $subject->id,
            'subject_name' => 'required|string|max:255',
            'units' => 'required|integer|min:1',
            'status' => 'required|in:available,occupied,maintenance',
        ]);

        $subject->update($validated);

        return redirect(route('subject'))->with('message', 'Subject updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Subject $subject)
    {
        //
    }
}
