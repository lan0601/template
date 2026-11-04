<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $module = 'users'): Response
    {
        $user = $request->user();
        $permissions = $user?->userRole?->permissions ?? $user?->permissions ?? [];
        $isAdmin = strtolower((string) $user?->role) === 'admin';
        $hasModulePermission = filter_var($permissions[$module] ?? false, FILTER_VALIDATE_BOOLEAN);

        abort_unless($user && ($isAdmin || $hasModulePermission), Response::HTTP_FORBIDDEN);

        return $next($request);
    }
}
