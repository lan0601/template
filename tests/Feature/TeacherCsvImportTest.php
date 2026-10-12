<?php

use App\Models\User;
use App\Models\Userrole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

beforeEach(function () {
    $role = Userrole::firstOrCreate(['role_name' => 'admin'], ['permissions' => []]);

    $this->actingAs(User::factory()->create([
        'role' => 'Admin',
        'userroleid' => $role->id,
    ]));
});

test('teachers can be imported from a csv file', function () {
    $response = $this->post(route('userrole.import-teachers'), [
        'file' => UploadedFile::fake()->createWithContent(
            'teachers.csv',
            "name,email,lname,phone,campusID\nTaylor,taylor@example.com,Nguyen,555-0100,CAMP-100\n"
        ),
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertSessionHas('success', '1 teacher(s) imported successfully.');

    $teacher = User::where('email', 'taylor@example.com')->firstOrFail();
    expect($teacher->name)->toBe('Taylor')
        ->and($teacher->lname)->toBe('Nguyen')
        ->and($teacher->phone)->toBe('555-0100')
        ->and($teacher->campusID)->toBe('CAMP-100')
        ->and($teacher->role)->toBe('Teacher')
        ->and($teacher->userroleid)->toBe(Userrole::where('role_name', 'teacher')->value('id'))
        ->and(Hash::check('NTC@edu.ph', $teacher->password))->toBeTrue();
});

test('students can be imported from a csv file', function () {
    $response = $this->post(route('userrole.import-students'), [
        'file' => UploadedFile::fake()->createWithContent(
            'students.csv',
            "name,email,lname,phone,campusID\nTaylor,taylor.student@example.com,Nguyen,555-0100,STU-100\n"
        ),
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertSessionHas('success', '1 student(s) imported successfully.');

    $student = User::where('email', 'taylor.student@example.com')->firstOrFail();
    expect($student->name)->toBe('Taylor')
        ->and($student->lname)->toBe('Nguyen')
        ->and($student->phone)->toBe('555-0100')
        ->and($student->campusID)->toBe('STU-100')
        ->and($student->role)->toBe('Student')
        ->and($student->userroleid)->toBe(Userrole::where('role_name', 'student')->value('id'))
        ->and(Hash::check('NTC@edu.ph', $student->password))->toBeTrue();
});

test('student import reactivates a removed student when email and campus id are reused', function () {
    $removedStudent = User::factory()->create([
        'name' => 'Old Name',
        'email' => 'returning.student@example.com',
        'campusID' => 'STU-RETURN',
        'role' => 'Student',
        'remove' => 1,
    ]);

    $response = $this->post(route('userrole.import-students'), [
        'file' => UploadedFile::fake()->createWithContent(
            'students.csv',
            "name,email,campusID\nReturning Student,returning.student@example.com,STU-RETURN\n"
        ),
    ]);

    $response->assertSessionHasNoErrors();
    $removedStudent->refresh();

    expect(User::where('email', 'returning.student@example.com')->count())->toBe(1)
        ->and($removedStudent->name)->toBe('Returning Student')
        ->and($removedStudent->remove)->toBe(0)
        ->and($removedStudent->role)->toBe('Student');
});

test('import reactivates a removed teacher when email and campus id are reused', function () {
    $removedTeacher = User::factory()->create([
        'name' => 'Old Name',
        'email' => 'returning@example.com',
        'campusID' => 'CAMP-RETURN',
        'role' => 'Teacher',
        'remove' => 1,
    ]);

    $response = $this->post(route('userrole.import-teachers'), [
        'file' => UploadedFile::fake()->createWithContent(
            'teachers.csv',
            "name,email,campusID\nReturning Teacher,returning@example.com,CAMP-RETURN\n"
        ),
    ]);

    $response->assertSessionHasNoErrors();
    $removedTeacher->refresh();

    expect(User::where('email', 'returning@example.com')->count())->toBe(1)
        ->and($removedTeacher->name)->toBe('Returning Teacher')
        ->and($removedTeacher->remove)->toBe(0);
});

test('a csv with an existing email does not partially import teachers', function () {
    User::factory()->create(['email' => 'existing@example.com']);

    $response = $this->post(route('userrole.import-teachers'), [
        'file' => UploadedFile::fake()->createWithContent(
            'teachers.csv',
            "name,email\nNew,new@example.com\nExisting,existing@example.com\n"
        ),
    ]);

    $response->assertSessionHasErrors('file');
    expect(User::where('email', 'new@example.com')->exists())->toBeFalse();
});

test('a csv with a duplicate campus id does not partially import teachers', function () {
    User::factory()->create(['email' => 'current@example.com', 'campusID' => 'CAMP-500']);

    $response = $this->post(route('userrole.import-teachers'), [
        'file' => UploadedFile::fake()->createWithContent(
            'teachers.csv',
            "name,email,campusID\nNew,new@example.com,CAMP-501\nDuplicate,duplicate@example.com,CAMP-500\n"
        ),
    ]);

    $response->assertSessionHasErrors('file');
    expect(User::where('email', 'new@example.com')->exists())->toBeFalse();
});

test('a csv cannot contain duplicate campus ids', function () {
    $response = $this->post(route('userrole.import-teachers'), [
        'file' => UploadedFile::fake()->createWithContent(
            'teachers.csv',
            "name,email,campusID\nFirst,first@example.com,CAMP-600\nSecond,second@example.com,CAMP-600\n"
        ),
    ]);

    $response->assertSessionHasErrors('file');
    expect(User::whereIn('email', ['first@example.com', 'second@example.com'])->count())->toBe(0);
});

test('a user can be created with a campus id', function () {
    $response = $this->post(route('userrole.store'), [
        'name' => 'Morgan',
        'lname' => 'Lee',
        'email' => 'morgan@example.com',
        'roleid' => '3',
        'phone' => '555-0199',
        'campusID' => 'CAMP-200',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    $response->assertSessionHasNoErrors();
    expect(User::where('email', 'morgan@example.com')->value('campusID'))->toBe('CAMP-200');
});

test('a user cannot be created with an existing campus id', function () {
    User::factory()->create(['campusID' => 'CAMP-700']);

    $response = $this->from('/userrole')->post(route('userrole.store'), [
        'name' => 'Alex',
        'email' => 'alex@example.com',
        'roleid' => '3',
        'campusID' => 'CAMP-700',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    $response->assertSessionHasErrors('campusID');
    expect(User::where('email', 'alex@example.com')->exists())->toBeFalse();
});

test('a user profile can be edited without changing the email address', function () {
    $user = User::factory()->create([
        'name' => 'Jordan',
        'email' => 'jordan@example.com',
        'phone' => '555-0101',
        'campusID' => 'CAMP-300',
        'role' => 'Student',
        'userroleid' => 2,
    ]);

    $response = $this->patch(route('userrole.update', $user), [
        'name' => 'Jordan Lee',
        'lname' => 'Morgan',
        'email' => 'jordan@example.com',
        'phone' => '555-0102',
        'campusID' => 'CAMP-301',
        'role' => 'Teacher',
    ]);

    $response->assertSessionHasNoErrors();
    $user->refresh();

    expect($user->name)->toBe('Jordan Lee')
        ->and($user->lname)->toBe('Morgan')
        ->and($user->email)->toBe('jordan@example.com')
        ->and($user->phone)->toBe('555-0102')
        ->and($user->campusID)->toBe('CAMP-301')
        ->and($user->role)->toBe('Teacher')
        ->and($user->userroleid)->toBe(3);
});

test('a profile update may keep the user campus id but cannot use another users campus id', function () {
    $user = User::factory()->create(['campusID' => 'CAMP-800']);
    $anotherUser = User::factory()->create(['campusID' => 'CAMP-801']);

    $baseProfile = [
        'name' => $user->name,
        'lname' => $user->lname ?? '',
        'email' => $user->email,
        'phone' => $user->phone ?? '',
        'role' => 'Guest',
    ];

    $sameCampusResponse = $this->patch(route('userrole.update', $user), [
        ...$baseProfile,
        'campusID' => 'CAMP-800',
    ]);
    $sameCampusResponse->assertSessionHasNoErrors();

    $duplicateCampusResponse = $this->from('/userrole')->patch(route('userrole.update', $user), [
        ...$baseProfile,
        'campusID' => $anotherUser->campusID,
    ]);

    $duplicateCampusResponse->assertSessionHasErrors('campusID');
    expect($user->fresh()->campusID)->toBe('CAMP-800');
});