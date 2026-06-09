<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PostsController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\Schedule2Controller;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\EnrollController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/portfolio', function () {
    return Inertia::render('Portfolio', [
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/posts', [PostsController::class, 'index'])->middleware(['auth', 'verified'])->name('posts.index');
Route::get('/posts/new', [PostsController::class, 'new'])->middleware(['auth', 'verified'])->name('posts.new');

Route::get('/products',function(){
    return Inertia::render('AllProductComponent'); 
});

Route::get('/students',function(){
    return Inertia::render('AllStudentComponent'); 
})->middleware(['auth', 'verified'])->name('students');

Route::get('/appliance',function(){
    return Inertia::render('ApplianceComponent'); 
})->middleware(['auth', 'verified'])->name('appliance');

Route::get('/color',function(){
    return Inertia::render('ColorComponent'); 
})->middleware(['auth', 'verified'])->name('color');;
// Enroll routes -----------------------------------------------
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/enroll', [EnrollController::class, 'index'])->name('enroll');
    Route::get('/enroll/create', [EnrollController::class, 'create'])->name('enroll.create');
    Route::post('/enroll', [EnrollController::class, 'store'])->name('enroll.store');
    // Route::post('/subject', [SubjectController::class, 'store'])->name('subject.store');
    Route::get('/enroll/{student}/edit', [EnrollController::class, 'edit'])->name('enroll.edit');
    Route::patch('/enroll/{student}', [EnrollController::class, 'update'])->name('enroll.update');
    // Route::patch('/subject/{subject}', [SubjectController::class, 'update'])->name('subject.update');
    // Route::delete('/subject/{subject}', [SubjectController::class, 'destroy'])->name('subject.destroy');
});
// Schedule routes ----------------------------------------------
Route::get('/schedule', [ScheduleController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('schedule');

Route::post('/schedule/store', [ScheduleController::class, 'store'])
    ->middleware(['auth', 'verified']);

Route::post('/schedule/{schedule}/status', [ScheduleController::class, 'updateStatus'])
    ->middleware(['auth', 'verified']);

Route::post('/schedules/events', [ScheduleController::class, 'get'])
    ->middleware(['auth', 'verified']);

// Schedule2 routes ----------------------------------------------
Route::get('/schedule2', [Schedule2Controller::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('schedule2');

Route::post('/schedule2/store', [Schedule2Controller::class, 'store'])
    ->middleware(['auth', 'verified']);

Route::post('/schedule2/{schedule}/status', [Schedule2Controller::class, 'updateStatus'])
    ->middleware(['auth', 'verified']);

Route::post('/schedule2s/events', [Schedule2Controller::class, 'get'])
    ->middleware(['auth', 'verified']);

// Attendance route ----------------------------------------------
Route::get('/attendance', [AttendanceController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('attendance');
// Classroom routes -----------------------------------------------
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/classroom', [ClassroomController::class, 'index'])->name('classroom');
    Route::get('/classroom/create', [ClassroomController::class, 'create'])->name('classroom.create');
    Route::post('/classroom', [ClassroomController::class, 'store'])->name('classroom.store');
    Route::get('/classroom/{classroom}/qr', [ClassroomController::class, 'qr'])->name('classroom.qr');
    Route::get('/classroom/{classroom}/edit', [ClassroomController::class, 'edit'])->name('classroom.edit');
    Route::patch('/classroom/{classroom}', [ClassroomController::class, 'update'])->name('classroom.update');
    Route::delete('/classroom/{classroom}', [ClassroomController::class, 'destroy'])->name('classroom.destroy');
});
// Subject routes -----------------------------------------------
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/subject', [SubjectController::class, 'index'])->name('subject');
    Route::get('/subject/create', [SubjectController::class, 'create'])->name('subject.create');
    Route::post('/subject', [SubjectController::class, 'store'])->name('subject.store');
    Route::get('/subject/{subject}/edit', [SubjectController::class, 'edit'])->name('subject.edit');
    Route::patch('/subject/{subject}', [SubjectController::class, 'update'])->name('subject.update');
    Route::delete('/subject/{subject}', [SubjectController::class, 'destroy'])->name('subject.destroy');
});
//Dashboard route ------------------------------------------------
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
