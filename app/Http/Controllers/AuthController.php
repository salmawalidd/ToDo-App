<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    private function errorResponse(string $message, string $code, int $status)
    {
        return response()->json([
            'error' => [
                'message' => $message,
                'code' => $code,
            ]
        ], $status);
    }

    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        Log::info('Register attempt', [
            'email' => $validated['email'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        Log::info('User registered successfully', [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $validated = $request->validated();

        Log::info('Login attempt', [
            'email' => $validated['email'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        Log::info('User lookup', [
            'found' => $user !== null,
            'user_id' => $user?->id,
        ]);

        if ($user) {
            Log::info('Password verification', [
                'matches' => Hash::check($validated['password'], $user->password),
                'stored_password_prefix' => substr($user->password, 0, 10),
            ]);
        }

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            Log::warning('Login failed', [
                'email' => $validated['email'],
            ]);

            return $this->errorResponse(
                'Invalid email or password',
                'INVALID_CREDENTIALS',
                401
            );
        }

        $token = $user->createToken('api-token')->plainTextToken;

        Log::info('Login successful', [
            'user_id' => $user->id,
        ]);

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        Log::info('Logout attempt', [
            'user_id' => $user?->id,
        ]);

        $token = $user?->currentAccessToken();

        if ($token) {
            $token->delete();

            Log::info('Token deleted', [
                'user_id' => $user?->id,
            ]);
        }

        return response()->noContent();
    }
}
