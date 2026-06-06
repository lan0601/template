<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;


class ClassroomController extends Controller
{
    /**
     * Display a listing of the classrooms.
     */
    public function index()
    {
        $classrooms = Classroom::all();

        return Inertia::render('Classroom/Index', [
            'classrooms' => $classrooms,
        ]);
    }

    /**
     * Show the form for creating a new classroom.
     */
    public function create()
    {
        return Inertia::render('Classroom/Create');
    }

    /**
     * Store a newly created classroom in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_name' => 'required|string|max:255',
            'room_number' => 'required|string|max:255|unique:classrooms',
            'building' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'status' => 'required|in:available,occupied,maintenance',
        ]);
        //Create classroom
        $classroom = Classroom::create($validated);
        // Generate QR code
        $qrFileName = 'classroom_' . $validated['room_number'] . '.svg';
        $qrCode = QrCode::format('svg')->size(300)->generate('CLASSROOM-' . $validated['room_number']);
        // Store QR code
        Storage::disk('public')->put(
            'qrcodes/' . $qrFileName,
            $qrCode
        );

        // Update classroom with QR code path
        $classroom->update(['qr_path' => 'qrcodes/' . $qrFileName]);

        return redirect(route('classroom'))->with('message', 'Classroom created successfully.');
    }

    /**
     * Generate QR code for the specified classroom.
     */
    public function qr(Classroom $classroom)
    {
    }

    /**
     * Show the form for editing the specified classroom.
     */
    public function edit(Classroom $classroom)
    {
        return Inertia::render('Classroom/Edit', [
            'classroom' => $classroom,
        ]);
    }

    /**
     * Update the specified classroom in storage.
     */
    public function update(Request $request, Classroom $classroom)
    {
        $validated = $request->validate([
            'room_name' => 'required|string|max:255',
            'room_number' => 'required|string|max:255|unique:classrooms,room_number,' . $classroom->id,
            'building' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'status' => 'required|in:available,occupied,maintenance',
        ]);

        $classroom->update($validated);

        return redirect(route('classroom'))->with('message', 'Classroom updated successfully.');
    }

    /**
     * Remove the specified classroom from storage.
     */
    public function destroy(Classroom $classroom)
    {
        $classroom->delete();

        return redirect(route('classroom'))->with('message', 'Classroom deleted successfully.');
    }
}
