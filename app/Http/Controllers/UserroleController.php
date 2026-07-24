<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Userrole;
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
            ->select(['id', 'name', 'email', 'phone', 'role', 'userroleid'])
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
        // dd($request->all());
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
            1 => 'Admin',
            2 => 'Student',
            3 => 'Teacher',
            4 => 'Guest',
            default => 'Guest',
        };

        User::create([
            'name' => trim($validated['name']),
            'lname' => trim($validated['lname'] ?? 'User'),
            'email' => $validated['email'],
            'role' => $roleName,
            'userroleid' => $roleId,
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

        $roleName = $validated['role'];
        $roleId = match ($roleName) {
            'Admin' => 1,
            'Student' => 2,
            'Teacher' => 3,
            'Guest' => 4,
            default => 4,
        };

        $role = Userrole::firstOrCreate([
            'id' => $roleId,
        ], [
            'role_name' => $roleName,
            'permissions' => [],
        ]);

        $user->update([
            'role' => $roleName,
            'userroleid' => $role->id,
        ]);

        return back()->with('success', 'User role updated successfully.');
    }

    public function destroy(User $user)
    {
        // $user->delete();
        $user->update(['remove' => 1]);

        return back()->with('success', 'User deleted successfully.');
    }

    public function permissions()
    {
        $roles = ['admin', 'teacher', 'student', 'guest'];
        $pages = ['dashboard', 'attendance', 'enroll', 'schedule', 'classroom', 'subject', 'users', 'section', 'subject_offering'];

        $permissionMap = [];
        foreach ($roles as $roleName) {
            $role = Userrole::firstOrCreate([
                'role_name' => $roleName,
            ], [
                'permissions' => [],
            ]);

            $permissionMap[$roleName] = [];
            foreach ($pages as $page) {
                $permissionMap[$roleName][$page] = false;
            }

            foreach ($role->permissions ?? [] as $page => $allowed) {
                $permissionMap[$roleName][$page] = (bool) $allowed;
            }
        }

        return Inertia::render('Userrole/Permissions', [
            'roles' => array_keys($permissionMap),
            'pages' => $pages,
            'permissions' => $permissionMap,
        ]);
    }

    public function savePermissions(Request $request)
    {
        $validated = $request->validate([
            'permissions' => 'required|array',
        ]);

        foreach ($validated['permissions'] as $roleName => $pages) {
            $role = Userrole::firstOrCreate([
                'role_name' => $roleName,
            ], [
                'permissions' => [],
            ]);

            $role->update(['permissions' => $pages]);
        }

        return redirect()->route('userrole.permissions')->with('success', 'Role permissions updated successfully.');
    }
}
