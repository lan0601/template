<?php

use App\Models\User;
use App\Models\Userrole;

test('role access page can be viewed and updated', function () {
    $adminRole = Userrole::firstOrCreate(['role_name' => 'admin'], ['permissions' => []]);
    $teacherRole = Userrole::firstOrCreate(['role_name' => 'teacher'], ['permissions' => []]);

    $admin = User::factory()->create([
        'name' => 'Admin User',
        'email' => 'admin@example.com',
        'role' => 'admin',
        'userroleid' => $adminRole->id,
    ]);

    $this->actingAs($admin);

    $response = $this->get('/userrole/access');
    $response->assertOk();

    $response = $this->post('/userrole/access', [
        'permissions' => [
            'admin' => ['dashboard' => true, 'classroom' => false, 'enroll' => true],
            'teacher' => ['dashboard' => true, 'classroom' => true, 'enroll' => false],
        ],
    ]);

    $response->assertRedirect(route('userrole.permissions'));

    $adminRole->refresh();
    $teacherRole->refresh();

    expect($adminRole->permissions)->toMatchArray([
        'dashboard' => true,
        'classroom' => false,
        'enroll' => true,
    ]);

    expect($teacherRole->permissions)->toMatchArray([
        'dashboard' => true,
        'classroom' => true,
        'enroll' => false,
    ]);
});
