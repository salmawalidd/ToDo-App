<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TodoController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public authentication routes
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Protected routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    Route::post('/logout', [AuthController::class, 'logout']);

    /*
    |--------------------------------------------------------------------------
    | Todo routes
    |--------------------------------------------------------------------------
    */

    Route::get('/todos', [TodoController::class, 'index']);
    Route::post('/todos', [TodoController::class, 'store']);
    Route::get('/todos/{id}', [TodoController::class, 'show']);
    Route::patch('/todos/{id}', [TodoController::class, 'update']);
    Route::delete('/todos/{id}', [TodoController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | User administration routes
    |--------------------------------------------------------------------------
    */

    Route::get('/users', [UserController::class, 'index'])
        ->middleware('permission:manage users');

    Route::delete('/users/{id}', [UserController::class, 'destroy'])
        ->middleware('permission:delete users');

    /*
    |--------------------------------------------------------------------------
    | Role and permission management routes
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/roles-permissions',
        [UserController::class, 'accessOptions']
    )->middleware(
        'permission:manage roles and permissions'
    );

    Route::patch(
        '/users/{id}/access',
        [UserController::class, 'updateAccess']
    )->middleware(
        'permission:manage roles and permissions'
    );
});
