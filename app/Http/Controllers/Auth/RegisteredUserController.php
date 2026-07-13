<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'lname' => 'nullable|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'roleid' => 'nullable|string|max:10',
            'phone' => 'nullable|string|max:20',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $roleId = (int) ($validated['roleid'] ?? 4);
        $roleName = match ($roleId) {
            1 => 'admin',
            2 => 'student',
            3 => 'teacher',
            4 => 'guest',
            default => 'guest',
        };

        $role = \App\Models\Userrole::firstOrCreate([
            'id' => $roleId,
        ], [
            'role_name' => $roleName,
            'permissions' => [],
        ]);

        $user = User::create([
            'name' => trim($validated['name']),
            'lname' => trim($validated['lname'] ?? 'User'),
            'email' => $validated['email'],
            'role' => $roleName,
            'userroleid' => $role->id,
            'phone' => trim($validated['phone'] ?? ''),
            'password' => Hash::make($validated['password']),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
