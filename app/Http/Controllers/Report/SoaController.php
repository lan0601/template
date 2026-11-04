<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Userrole;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SoaController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Report/Soa', [
            'users' => User::query()
                ->select(['id', 'name', 'lname', 'email', 'phone', 'campusID', 'userroleid', 'remove', 'created_at'])
                ->with('userRole:id,role_name')
                ->orderBy('name')
                ->orderBy('lname')
                ->paginate(15)
                ->withQueryString(),
            'roles' => $this->roles(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Users', [
            'users' => $this->users(),
            'roles' => $this->roles(),
            'user' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validated($request);
        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return to_route('admin.users.index')->with('success', 'User created successfully.');
    }

    public function edit(User $user): Response
    {
        $user->load('userRole');

        return Inertia::render('Admin/Users', [
            'users' => $this->users(),
            'roles' => $this->roles(),
            'user' => [
                ...$user->only(['id', 'name', 'lname', 'email', 'phone', 'campusID', 'remove']),
                'userroleid' => $user->userroleid,
            ],
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $this->validated($request, $user);
        if (blank($validated['password'] ?? null)) {
            unset($validated['password']);
        } else {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return to_route('admin.users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_if($request->user()->is($user), 422, 'You cannot delete your own account.');

        $user->delete();

        return to_route('admin.users.index')->with('success', 'User deleted successfully.');
    }

    private function validated(Request $request, ?User $user = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'lname' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user?->id)],
            'phone' => ['nullable', 'string', 'max:20'],
            'campusID' => ['nullable', 'string', 'max:255', Rule::unique('users', 'campusID')->ignore($user?->id)],
            'userroleid' => ['required', 'integer', 'exists:user_roles,id'],
            'password' => [$user ? 'nullable' : 'required', 'string', 'min:8', 'confirmed'],
            'remove' => ['boolean'],
        ]);
    }

    private function users(): array
    {
        return User::query()
            ->select(['id', 'name', 'lname', 'email', 'phone', 'campusID', 'userroleid', 'remove', 'created_at'])
            ->with('userRole:id,role_name')
            ->orderBy('name')
            ->orderBy('lname')
            ->get()
            ->toArray();
    }

    private function roles(): array
    {
        return Userrole::query()
            ->select(['id', 'role_name'])
            ->orderBy('role_name')
            ->get()
            ->toArray();
    }
}
