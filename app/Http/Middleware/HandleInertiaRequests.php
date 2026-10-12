<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        $rolePermissions = $user?->userRole?->permissions ?? $user?->permissions ?? [];

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'permissions' => $rolePermissions,
                'impersonating' => $request->session()->has('impersonator_id'),
                'impersonator' => $request->session()->has('impersonator_id')
                    ? \App\Models\User::query()->find($request->session()->get('impersonator_id'))?->only(['id', 'name', 'email'])
                    : null,
            ],
        ];
    }
}
