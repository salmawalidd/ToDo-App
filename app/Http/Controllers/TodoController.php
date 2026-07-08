<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TodoController extends Controller
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

    public function index(Request $request)
    {
        $query = Todo::orderBy('created_at', 'desc');

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

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse(
                $validator->errors()->first(),
                'VALIDATION_ERROR',
                400
            );
        }

        $validated = $validator->validated();

        $todo = Todo::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'completed' => false,
        ]);

        return response()->json($todo, 201);
    }

    public function show(int $id)
    {
        $todo = Todo::find($id);

        if (!$todo) {
            return $this->errorResponse('Todo not found', 'NOT_FOUND', 404);
        }

        return response()->json($todo);
    }

    public function update(Request $request, int $id)
    {
        $todo = Todo::find($id);

        if (!$todo) {
            return $this->errorResponse('Todo not found', 'NOT_FOUND', 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'completed' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse(
                $validator->errors()->first(),
                'VALIDATION_ERROR',
                400
            );
        }

        $todo->update($validator->validated());

        return response()->json($todo);
    }

    public function destroy(int $id)
    {
        $todo = Todo::find($id);

        if (!$todo) {
            return $this->errorResponse('Todo not found', 'NOT_FOUND', 404);
        }

        $todo->delete();

        return response()->noContent();
    }
}
