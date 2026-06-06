<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PostsController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\ClassroomController;
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
