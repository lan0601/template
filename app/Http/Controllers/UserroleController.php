<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Userrole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
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
        abort_unless(strtolower((string) $request->user()?->role) === 'admin', 403);

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

    public function importStudents(Request $request)
    {
        abort_unless(strtolower((string) $request->user()?->role) === 'admin', 403);

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
            $student = [
                'name' => trim((string) ($data['name'] ?? '')),
                'lname' => trim((string) ($data['lname'] ?? '')),
                'email' => strtolower(trim((string) ($data['email'] ?? ''))),
                'phone' => trim((string) ($data['phone'] ?? '')),
                'campusID' => trim((string) ($data['campusid'] ?? '')) ?: null,
            ];

            if (isset($seenEmails[$student['email']])) {
                $errors[] = "Row {$lineNumber} duplicates an email address in the CSV.";
            }
            $seenEmails[$student['email']] = true;

            if ($student['campusID'] !== null) {
                $campusKey = strtolower($student['campusID']);
                if (isset($seenCampusIds[$campusKey])) {
                    $errors[] = "Row {$lineNumber} duplicates a campus ID in the CSV.";
                }
                $seenCampusIds[$campusKey] = true;
            }

            $rows[] = ['data' => $student, 'line' => $lineNumber];
        }

        fclose($handle);

        foreach (array_chunk($rows, 500) as $rowBatch) {
            $validator = Validator::make(array_column($rowBatch, 'data'), [
                '*.name' => ['required', 'string', 'max:255'],
                '*.lname' => ['nullable', 'string', 'max:255'],
                '*.email' => ['required', 'string', 'email', 'max:255'],
                '*.phone' => ['nullable', 'string', 'max:20'],
                '*.campusID' => ['nullable', 'string', 'max:50'],
            ]);

            foreach ($validator->errors()->messages() as $attribute => $messages) {
                $batchIndex = (int) explode('.', $attribute, 2)[0];
                $sourceLine = $rowBatch[$batchIndex]['line'];
                foreach ($messages as $message) {
                    $errors[] = "Row {$sourceLine}: {$message}";
                }
            }
        }

        if ($errors !== []) {
            return back()->withErrors(['file' => implode(' ', array_slice($errors, 0, 10))]);
        }

        if ($rows === []) {
            return back()->withErrors(['file' => 'The CSV contains no student rows to import.']);
        }

        $matchedUsers = collect();
        foreach (array_chunk($rows, 400) as $rowBatch) {
            $emails = array_column(array_column($rowBatch, 'data'), 'email');
            $campusIds = array_values(array_filter(array_column(array_column($rowBatch, 'data'), 'campusID')));

            $matchedUsers = $matchedUsers->merge(User::query()
                ->where(function ($query) use ($emails, $campusIds) {
                    if ($emails !== []) {
                        $query->whereIn('email', $emails);
                    }
                    if ($campusIds !== []) {
                        $emails === []
                            ? $query->whereIn('campusID', $campusIds)
                            : $query->orWhereIn('campusID', $campusIds);
                    }
                })
                ->get(['id', 'email', 'campusID', 'remove', 'created_at']));
        }

        $usersByEmail = $matchedUsers->filter(fn ($user) => $user->email !== null)
            ->keyBy(fn ($user) => strtolower($user->email));
        $usersByCampusId = $matchedUsers->filter(fn ($user) => $user->campusID !== null)
            ->keyBy(fn ($user) => strtolower($user->campusID));

        foreach ($rows as $row) {
            $student = $row['data'];
            $emailMatch = $usersByEmail->get($student['email']);
            $campusMatch = $student['campusID'] === null
                ? null
                : $usersByCampusId->get(strtolower($student['campusID']));

            if ($emailMatch && ! $emailMatch->remove) {
                $errors[] = "Row {$row['line']}: The email has already been taken.";
            }
            if ($campusMatch && ! $campusMatch->remove) {
                $errors[] = "Row {$row['line']}: The campus id has already been taken.";
            }
        }

        if ($errors !== []) {
            return back()->withErrors(['file' => implode(' ', array_slice($errors, 0, 10))]);
        }

        $passwordHash = Hash::make('NTC@edu.ph');

        DB::transaction(function () use ($rows, $usersByEmail, $usersByCampusId, $passwordHash) {
            $studentRole = Userrole::firstOrCreate(
                ['role_name' => 'student'],
                ['id' => 2, 'permissions' => []]
            );
            $newStudents = [];
            $reactivatedStudents = [];
            $timestamp = now();

            foreach ($rows as $row) {
                $student = $row['data'];
                $emailMatch = $usersByEmail->get($student['email']);
                $campusMatch = $student['campusID'] === null
                    ? null
                    : $usersByCampusId->get(strtolower($student['campusID']));
                $existingUser = $emailMatch?->remove
                    ? $emailMatch
                    : ($campusMatch?->remove ? $campusMatch : null);

                if ($existingUser && $campusMatch && $campusMatch->id !== $existingUser->id) {
                    $reactivatedStudents[] = [
                        'id' => $campusMatch->id,
                        'campusID' => null,
                        'updated_at' => $timestamp,
                    ];
                }

                $attributes = [
                    ...$student,
                    'role' => 'Student',
                    'userroleid' => $studentRole->id,
                    'password' => $passwordHash,
                    'remove' => 0,
                ];

                if ($existingUser) {
                    $reactivatedStudents[] = [
                        ...$attributes,
                        'id' => $existingUser->id,
                        'created_at' => $existingUser->created_at,
                        'updated_at' => $timestamp,
                    ];
                } else {
                    $newStudents[] = [
                        ...$attributes,
                        'created_at' => $timestamp,
                        'updated_at' => $timestamp,
                    ];
                }
            }

            foreach (array_chunk($reactivatedStudents, 80) as $batch) {
                User::upsert($batch, ['id'], ['name', 'lname', 'email', 'phone', 'campusID', 'password', 'role', 'userroleid', 'remove', 'updated_at']);
            }

            foreach (array_chunk($newStudents, 80) as $batch) {
                User::insert($batch);
            }
        });

        return back()->with('success', count($rows).' student(s) imported successfully.');
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

    public function impersonate(Request $request, User $user)
    {
        abort_unless(strtolower((string) $request->user()?->role) === 'admin', 403);
        abort_if($request->session()->has('impersonator_id'), 403);
        abort_if($user->remove || strtolower((string) $user->role) === 'admin', 404);

        $request->session()->put('impersonator_id', $request->user()->id);
        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('dashboard');
    }

    public function stopImpersonating(Request $request)
    {
        $admin = User::query()
            ->whereKey($request->session()->get('impersonator_id'))
            ->where('remove', 0)
            ->first();

        abort_unless($admin && strtolower((string) $admin->role) === 'admin', 403);

        Auth::login($admin);
        $request->session()->forget('impersonator_id');
        $request->session()->regenerate();

        return redirect()->route('userrole');
    }

    public function permissions()
    {
        $roles = ['admin', 'teacher', 'student', 'guest'];
        $pages = [
            'dashboard',
            'attendance',
            'schedule2',
            'cschedule',
            'userrole',
            'subject',
            'section',
            'classroom',
            'subjectoffering',
            'enrollmentsubject',
            'enroll',
        ];

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
