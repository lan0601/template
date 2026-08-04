<?php

namespace App\Http\Controllers;

use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;


class SectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $sections = Section::all();
        return Inertia::render('Section/Index', [
            'sections' => $sections,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Section/Create'); 
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'section_name' => 'required|string|max:255|unique:sections',
            'course_id' => 'nullable|string|max:255',
            'year_level' => 'required|integer|min:1',
            'school_year' => 'required|string|max:255',
            'semester' => 'required|integer',
            'status' => 'required|integer',
        ]);
        Section::create($validated);

        return redirect(route('section'))->with('message', 'Section created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Section $section)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Section $section)
    {
        return Inertia::render('Section/Edit', [
            'section' => $section,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Section $section)
    {
        $validated = $request->validate([
            'section_name' => 'required|string|max:255|unique:sections,section_name,' . $section->id,
            'course_id' => 'nullable|string|max:255',
            'year_level' => 'required|integer|min:1',
            'school_year' => 'required|integer',
            'semester' => 'required|integer',
            'status' => 'required|integer',
        ]);

        $section->update($validated);

        return redirect(route('section'))->with('message', 'Section updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Section $section)
    {
        //
    }
}
