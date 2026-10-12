<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('admin can impersonate a user and return to their own account', function () {
    $admin = User::factory()->create(['role' => 'Admin', 'remove' => 0]);
    $target = User::factory()->create(['role' => 'Student', 'remove' => 0]);

    $this->actingAs($admin)
        ->post(route('userrole.impersonate', $target))
        ->assertRedirect(route('dashboard'));

    $this->assertAuthenticatedAs($target);
    $this->assertSame($admin->id, session('impersonator_id'));

    $this->post(route('userrole.stop-impersonating'))
        ->assertRedirect(route('userrole'));

    $this->assertAuthenticatedAs($admin);
    $this->assertFalse(session()->has('impersonator_id'));
});

test('non-admin users cannot impersonate accounts', function () {
    $student = User::factory()->create(['role' => 'Student', 'remove' => 0]);
    $target = User::factory()->create(['role' => 'Teacher', 'remove' => 0]);

    $this->actingAs($student)
        ->post(route('userrole.impersonate', $target))
        ->assertForbidden();

    $this->assertAuthenticatedAs($student);
});
