<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    private function errorResponse(
        string $message,
        string $code,
        int $status
    ): JsonResponse {
        return response()->json([
            'error' => [
                'message' => $message,
                'code' => $code,
            ],
        ], $status);
    }

    /**
     * Format the authenticated user for frontend responses.
     *
     * @return array<string, mixed>
     */
    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user
                ->getRoleNames()
                ->values(),
            'permissions' => $user
                ->getAllPermissions()
                ->pluck('name')
                ->values(),
        ];
    }

    public function register(
        RegisterRequest $request
    ): JsonResponse {
        $validated = $request->validated();

        Log::info('Register attempt', [
            'email' => $validated['email'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make(
                $validated['password']
            ),
        ]);

        // Assign the normal user role.
        $user->assignRole('user');

        $token = $user
            ->createToken('api-token')
            ->plainTextToken;

        Log::info('User registered successfully', [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        return response()->json([
            'user' => $this->formatUser($user),
            'token' => $token,
        ], 201);
    }

    public function login(
        LoginRequest $request
    ): JsonResponse {
        $validated = $request->validated();

        Log::info('Login attempt', [
            'email' => $validated['email'],
        ]);

        $user = User::where(
            'email',
            $validated['email']
        )->first();

        if (
            !$user ||
            !Hash::check(
                $validated['password'],
                $user->password
            )
        ) {
            Log::warning('Login failed', [
                'email' => $validated['email'],
            ]);

            return $this->errorResponse(
                'Invalid email or password',
                'INVALID_CREDENTIALS',
                401
            );
        }

        $token = $user
            ->createToken('api-token')
            ->plainTextToken;

        Log::info('Login successful', [
            'user_id' => $user->id,
        ]);

        return response()->json([
            'user' => $this->formatUser($user),
            'token' => $token,
        ], 200);
    }

    public function logout(
        Request $request
    ): Response {
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
