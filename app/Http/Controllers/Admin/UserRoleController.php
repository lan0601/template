<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Userrole;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserRoleController extends Controller
{
    public function index(): Response
    {
        return $this->formResponse();
    }

    public function create(): Response
    {
        return $this->formResponse();
    }

    public function store(Request $request): RedirectResponse
    {
        Userrole::create($this->validated($request));
        return to_route('admin.user-roles.index')->with('success', 'User role created successfully.');
    }

    public function edit(Userrole $userRole): Response
    {
        return $this->formResponse($userRole);
    }

    public function update(Request $request, Userrole $userRole): RedirectResponse
    {
        $userRole->update($this->validated($request, $userRole));
        return to_route('admin.user-roles.index')->with('success', 'User role updated successfully.');
    }

    public function destroy(Userrole $userRole): RedirectResponse
    {
        abort_if($userRole->users()->exists(), 422, 'This role is assigned to users and cannot be deleted.');
        $userRole->delete();
        return to_route('admin.user-roles.index')->with('success', 'User role deleted successfully.');
    }

    private function formResponse(?Userrole $role = null): Response
    {
        return Inertia::render('Admin/UserRoles', [
            'roles' => Userrole::query()->withCount('users')->orderBy('role_name')->get(),
            'modules' => Userrole::MODULES,
            'role' => $role,
        ]);
    }

    private function validated(Request $request, ?Userrole $role = null): array
    {
        $request->merge([
            'role_name' => strtolower(trim((string) $request->input('role_name'))),
        ]);

        $validated = $request->validate([
            'role_name' => ['required', 'string', 'max:100', 'lowercase', Rule::unique('user_roles', 'role_name')->ignore($role?->id)],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['boolean'],
        ]);

        $permissions = [];
        foreach (array_keys(Userrole::MODULES) as $module) {
            if (filter_var($validated['permissions'][$module] ?? false, FILTER_VALIDATE_BOOLEAN)) {
                $permissions[$module] = true;
            }
        }

        return ['role_name' => $validated['role_name'], 'permissions' => $permissions];
    }
}
