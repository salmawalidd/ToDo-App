<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::query()
            ->with('roles')
            ->latest()
            ->get()
            ->map(function (User $user): array {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user
                        ->getRoleNames()
                        ->values(),
                    'created_at' => $user->created_at,
                ];
            });

        return response()->json($users);
    }

    public function destroy(
        Request $request,
        int $id
    ): JsonResponse|Response {
        if ($request->user()?->id === $id) {
            return response()->json([
                'error' => [
                    'message' =>
                        'You cannot delete your own account.',
                    'code' =>
                        'SELF_DELETE_NOT_ALLOWED',
                ],
            ], 403);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'error' => [
                    'message' => 'User not found.',
                    'code' => 'NOT_FOUND',
                ],
            ], 404);
        }

        if ($user->hasRole('super-admin')) {
            return response()->json([
                'error' => [
                    'message' =>
                        'A super-admin account cannot be deleted.',
                    'code' =>
                        'SUPER_ADMIN_DELETE_NOT_ALLOWED',
                ],
            ], 403);
        }

        $user->delete();

        return response()->noContent();
    }
}
