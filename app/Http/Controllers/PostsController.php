<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class PostsController extends Controller
{
    public function index()
    {
        return Inertia::render('Posts/PostComponent');
    }

    public function new()
    {
        return Inertia::render('Posts/NewComponent');
    }
}
?>