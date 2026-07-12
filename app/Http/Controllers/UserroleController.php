<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class UserroleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::query()
            ->select(['id', 'name', 'email', 'phone', 'role'])
            ->where('remove', 0)
            ->where('role', '!=', 'admin')
            ->orderBy('name')
            ->get();

        return Inertia::render('Userrole/Index', [
            'users' => $users,
        ]);
    }

    public function create()
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'lname' => 'nullable|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'roleid' => 'nullable|string|max:10',
            'phone' => 'nullable|string|max:20',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $role = match ((string) ($validated['roleid'] ?? '')) {
            '2' => 'teacher',
            '3' => 'student',
            '4' => 'guest',
            default => 'guest',
        };

        User::create([
            'name' => trim($validated['name']),
            'lname' => trim($validated['lname'] ?? ''),
            'email' => $validated['email'],
            'role' => $role,
            'phone' => trim($validated['phone'] ?? ''),
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->route('userrole')->with('success', 'User created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => ['required', 'string', 'max:50'],
        ]);

        $user->update([
            'role' => $validated['role'],
        ]);

        return back()->with('success', 'User role updated successfully.');
    }

    public function destroy(User $user)
    {
        // $user->delete();
        $user->update(['remove' => 1]);

        return back()->with('success', 'User deleted successfully.');
    }
}
