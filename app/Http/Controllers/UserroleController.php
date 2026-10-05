<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Userrole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UserroleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::query()
            ->select(['id', 'name', 'lname', 'email', 'phone', 'campusID', 'role'])
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
            'campusID' => ['nullable', 'string', 'max:50', Rule::unique('users', 'campusID')],
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
            'campusID' => filled($validated['campusID'] ?? null) ? trim($validated['campusID']) : null,
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->route('userrole')->with('success', 'User created successfully.');
    }

    public function importTeachers(Request $request)
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
        ]);

        $handle = fopen($validated['file']->getRealPath(), 'r');
        if ($handle === false) {
            return back()->withErrors(['file' => 'The CSV file could not be read.']);
        }

        $headers = fgetcsv($handle);
        if ($headers === false) {
            fclose($handle);

            return back()->withErrors(['file' => 'The CSV file is empty.']);
        }

        $headers = array_map(static function ($header) {
            return strtolower(trim(preg_replace('/^\xEF\xBB\xBF/', '', (string) $header)));
        }, $headers);

        if (! in_array('name', $headers, true) || ! in_array('email', $headers, true) || count($headers) !== count(array_unique($headers))) {
            fclose($handle);

            return back()->withErrors(['file' => 'CSV headers must include unique name and email columns. lname, phone, and campusID are optional.']);
        }

        $rows = [];
        $errors = [];
        $seenEmails = [];
        $seenCampusIds = [];
        $lineNumber = 1;

        while (($values = fgetcsv($handle)) !== false) {
            $lineNumber++;

            if (count($values) === 1 && trim((string) $values[0]) === '') {
                continue;
            }

            if (count($values) !== count($headers)) {
                $errors[] = "Row {$lineNumber} has a different number of columns than the header.";
                continue;
            }

            $data = array_combine($headers, $values);
            $teacher = [
                'name' => trim((string) ($data['name'] ?? '')),
                'lname' => trim((string) ($data['lname'] ?? '')),
                'email' => strtolower(trim((string) ($data['email'] ?? ''))),
                'phone' => trim((string) ($data['phone'] ?? '')),
                'campusID' => trim((string) ($data['campusid'] ?? '')) ?: null,
            ];

            $validator = Validator::make($teacher, [
                'name' => ['required', 'string', 'max:255'],
                'lname' => ['nullable', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->where(fn ($query) => $query->where('remove', 0))],
                'phone' => ['nullable', 'string', 'max:20'],
                'campusID' => ['nullable', 'string', 'max:50', Rule::unique('users', 'campusID')->where(fn ($query) => $query->where('remove', 0))],
            ]);

            if (isset($seenEmails[$teacher['email']])) {
                $errors[] = "Row {$lineNumber} duplicates an email address in the CSV.";
            }
            $seenEmails[$teacher['email']] = true;

            if ($teacher['campusID'] !== null) {
                $campusKey = strtolower($teacher['campusID']);
                if (isset($seenCampusIds[$campusKey])) {
                    $errors[] = "Row {$lineNumber} duplicates a campus ID in the CSV.";
                }
                $seenCampusIds[$campusKey] = true;
            }

            if ($validator->fails()) {
                foreach ($validator->errors()->all() as $error) {
                    $errors[] = "Row {$lineNumber}: {$error}";
                }

                continue;
            }

            $rows[] = $teacher;
        }

        fclose($handle);

        if ($errors !== []) {
            return back()->withErrors(['file' => implode(' ', array_slice($errors, 0, 10))]);
        }

        if ($rows === []) {
            return back()->withErrors(['file' => 'The CSV contains no teacher rows to import.']);
        }

        DB::transaction(function () use ($rows) {
            $teacherRole = Userrole::firstOrCreate(
                ['role_name' => 'teacher'],
                ['id' => 3, 'permissions' => []]
            );

            foreach ($rows as $teacher) {
                $emailMatch = User::where('email', $teacher['email'])->first();
                $campusMatch = $teacher['campusID'] === null
                    ? null
                    : User::where('campusID', $teacher['campusID'])->first();
                $existingUser = $emailMatch?->remove
                    ? $emailMatch
                    : ($campusMatch?->remove ? $campusMatch : null);

                if ($existingUser && $campusMatch && $campusMatch->id !== $existingUser->id) {
                    $campusMatch->update(['campusID' => null]);
                }

                $attributes = [
                    ...$teacher,
                    'role' => 'Teacher',
                    'userroleid' => $teacherRole->id,
                    'password' => Hash::make('NTC@edu.ph'),
                    'remove' => 0,
                ];

                if ($existingUser) {
                    $existingUser->update($attributes);
                } else {
                    User::create($attributes);
                }
            }
        });

        return back()->with('success', count($rows).' teacher(s) imported successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'lname' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:20'],
            'campusID' => ['nullable', 'string', 'max:50', Rule::unique('users', 'campusID')->ignore($user->id)],
            'role' => ['required', Rule::in(['Admin', 'Student', 'Teacher', 'Guest'])],
        ]);

        $roleId = match ($validated['role']) {
            'Admin' => 1,
            'Student' => 2,
            'Teacher' => 3,
            'Guest' => 4,
        };

        $role = Userrole::firstOrCreate(
            ['id' => $roleId],
            ['role_name' => strtolower($validated['role']), 'permissions' => []]
        );

        $user->update([
            ...$validated,
            'userroleid' => $role->id,
        ]);

        return back()->with('success', 'User profile updated successfully.');
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
