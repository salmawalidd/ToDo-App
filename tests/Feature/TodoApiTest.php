<?php

namespace Tests\Feature;

use App\Models\Todo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TodoApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_todos(): void
    {
        Todo::create([
            'title' => 'Test todo',
            'description' => 'Test description',
            'completed' => false,
        ]);

        $response = $this->getJson('/api/todos');

        $response->assertStatus(200)
            ->assertJsonFragment([
                'title' => 'Test todo',
                'completed' => false,
            ]);
    }

    public function test_can_create_todo(): void
    {
        $response = $this->postJson('/api/todos', [
            'title' => 'New todo',
            'description' => 'Created from test',
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'title' => 'New todo',
                'description' => 'Created from test',
                'completed' => false,
            ]);

        $this->assertDatabaseHas('todos', [
            'title' => 'New todo',
        ]);
    }

    public function test_create_todo_requires_title(): void
    {
        $response = $this->postJson('/api/todos', []);

        $response->assertStatus(400)
            ->assertJsonStructure([
                'error' => [
                    'message',
                    'code',
                ],
            ])
            ->assertJsonFragment([
                'code' => 'VALIDATION_ERROR',
            ]);
    }

    public function test_can_show_single_todo(): void
    {
        $todo = Todo::create([
            'title' => 'Single todo',
            'description' => null,
            'completed' => false,
        ]);

        $response = $this->getJson("/api/todos/{$todo->id}");

        $response->assertStatus(200)
            ->assertJsonFragment([
                'title' => 'Single todo',
                'completed' => false,
            ]);
    }

    public function test_show_returns_404_for_missing_todo(): void
    {
        $response = $this->getJson('/api/todos/999');

        $response->assertStatus(404)
            ->assertJsonFragment([
                'code' => 'NOT_FOUND',
            ]);
    }

    public function test_can_update_todo(): void
    {
        $todo = Todo::create([
            'title' => 'Old title',
            'description' => 'Old description',
            'completed' => false,
        ]);

        $response = $this->patchJson("/api/todos/{$todo->id}", [
            'completed' => true,
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'title' => 'Old title',
                'completed' => true,
            ]);

        $this->assertDatabaseHas('todos', [
            'id' => $todo->id,
            'completed' => true,
        ]);
    }

    public function test_can_delete_todo(): void
    {
        $todo = Todo::create([
            'title' => 'Delete me',
            'description' => null,
            'completed' => false,
        ]);

        $response = $this->deleteJson("/api/todos/{$todo->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('todos', [
            'id' => $todo->id,
        ]);
    }
}
