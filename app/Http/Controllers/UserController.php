<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateUserAccessRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Format a user for admin API responses.
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

            'direct_permissions' => $user
                ->getDirectPermissions()
                ->pluck('name')
                ->values(),

            'permissions' => $user
                ->getAllPermissions()
                ->pluck('name')
                ->values(),

            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ];
    }

    /**
     * Return all users for the admin dashboard.
     */
    public function index(): JsonResponse
    {
        $users = User::query()
            ->with([
                'roles',
                'permissions',
            ])
            ->latest()
            ->get()
            ->map(
                fn (User $user): array =>
                    $this->formatUser($user)
            );

        return response()->json($users);
    }

    /**
     * Return all available roles and permissions.
     */
    public function accessOptions(): JsonResponse
    {
        $roles = Role::query()
            ->orderBy('name')
            ->pluck('name')
            ->values();

        $permissions = Permission::query()
            ->orderBy('name')
            ->pluck('name')
            ->values();

        return response()->json([
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Update a user's roles and direct permissions.
     */
    public function updateAccess(
        UpdateUserAccessRequest $request,
        int $id
    ): JsonResponse {
        $authenticatedUser = $request->user();

        if (!$authenticatedUser) {
            return response()->json([
                'error' => [
                    'message' => 'Unauthenticated.',
                    'code' => 'UNAUTHENTICATED',
                ],
            ], 401);
        }

        $targetUser = User::find($id);

        if (!$targetUser) {
            return response()->json([
                'error' => [
                    'message' => 'User not found.',
                    'code' => 'NOT_FOUND',
                ],
            ], 404);
        }

        $validated = $request->validated();

        $newRoles = $validated['roles'];
        $newPermissions = $validated['permissions'];

        /*
         * Prevent the logged-in super-admin from removing
         * their own super-admin role.
         */
        if (
            $authenticatedUser->id === $targetUser->id &&
            !in_array(
                'super-admin',
                $newRoles,
                true
            )
        ) {
            return response()->json([
                'error' => [
                    'message' =>
                        'You cannot remove your own super-admin role.',
                    'code' =>
                        'SELF_SUPER_ADMIN_REMOVAL_NOT_ALLOWED',
                ],
            ], 403);
        }

        /*
         * Prevent one super-admin from modifying
         * another super-admin account.
         */
        if (
            $targetUser->hasRole('super-admin') &&
            $authenticatedUser->id !== $targetUser->id
        ) {
            return response()->json([
                'error' => [
                    'message' =>
                        'Another super-admin account cannot be modified.',
                    'code' =>
                        'SUPER_ADMIN_ACCESS_PROTECTED',
                ],
            ], 403);
        }

        $targetUser->syncRoles($newRoles);

        /*
         * These are direct user permissions.
         * Permissions inherited from roles are not stored here.
         */
        $targetUser->syncPermissions($newPermissions);

        /*
         * Reload relationships so the response contains
         * the latest access information.
         */
        $targetUser->load([
            'roles',
            'permissions',
        ]);

        return response()->json([
            'message' => 'User access updated successfully.',
            'user' => $this->formatUser($targetUser),
        ]);
    }

    /**
     * Delete a user account.
     */
    public function destroy(
        Request $request,
        int $id
    ): JsonResponse|Response {
        $authenticatedUser = $request->user();

        if (!$authenticatedUser) {
            return response()->json([
                'error' => [
                    'message' => 'Unauthenticated.',
                    'code' => 'UNAUTHENTICATED',
                ],
            ], 401);
        }

        if ($authenticatedUser->id === $id) {
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
