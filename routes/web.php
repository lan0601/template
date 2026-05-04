<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PostsController;
use App\Http\Controllers\ScheduleController;
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

Route::get('/schedule', [ScheduleController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('schedule');

Route::post('/schedule/store', [ScheduleController::class, 'store'])
    ->middleware(['auth', 'verified']);

Route::post('/schedules/events', [ScheduleController::class, 'get'])
    ->middleware(['auth', 'verified']);
    
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
