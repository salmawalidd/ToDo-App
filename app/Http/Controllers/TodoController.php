<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTodoRequest;
use App\Http\Requests\UpdateTodoRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TodoController extends Controller
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

    public function index(Request $request): JsonResponse
    {
        $query = $request->user()
            ->todos()
            ->orderBy('created_at', 'desc');

        if ($request->has('completed')) {
            $completed = filter_var(
                $request->query('completed'),
                FILTER_VALIDATE_BOOLEAN,
                FILTER_NULL_ON_FAILURE
            );

            if ($completed === null) {
                return $this->errorResponse(
                    'completed must be true or false',
                    'VALIDATION_ERROR',
                    400
                );
            }

            $query->where('completed', $completed);
        }

        $todos = $query->get();

        return response()->json($todos);
    }

    public function store(
        StoreTodoRequest $request
    ): JsonResponse {
        $validated = $request->validated();

        $todo = $request->user()
            ->todos()
            ->create([
                'title' => $validated['title'],
                'description' =>
                    $validated['description'] ?? null,
                'completed' => false,
            ]);

        return response()->json($todo, 201);
    }

    public function show(
        Request $request,
        int $id
    ): JsonResponse {
        $todo = $request->user()
            ->todos()
            ->find($id);

        if (!$todo) {
            return $this->errorResponse(
                'Todo not found',
                'NOT_FOUND',
                404
            );
        }

        return response()->json($todo);
    }

    public function update(
        UpdateTodoRequest $request,
        int $id
    ): JsonResponse {
        $todo = $request->user()
            ->todos()
            ->find($id);

        if (!$todo) {
            return $this->errorResponse(
                'Todo not found',
                'NOT_FOUND',
                404
            );
        }

        $todo->update($request->validated());

        return response()->json($todo);
    }

    public function destroy(
        Request $request,
        int $id
    ): JsonResponse|Response {
        $todo = $request->user()
            ->todos()
            ->find($id);

        if (!$todo) {
            return $this->errorResponse(
                'Todo not found',
                'NOT_FOUND',
                404
            );
        }

        $todo->delete();

        return response()->noContent();
    }
}
