<?php

namespace App\Http\Controllers;

use App\Models\User;

class UserController extends Controller
{
    public function destroy(int $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'error' => [
                    'message' => 'User not found',
                    'code' => 'NOT_FOUND',
                ]
            ], 404);
        }

        $user->delete();

        return response()->noContent();
    }
}
