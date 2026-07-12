import type { Todo } from "./types/todo";

const API_URL = "http://localhost:3001/api";

export type CreateTodoData = {
  title: string;
  description?: string;
};

export async function getTodos(): Promise<Todo[]> {
  const response = await fetch(`${API_URL}/todos`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch todos: ${response.status}`);
  }

  return response.json();
}

export async function createTodo(
  todoData: CreateTodoData
): Promise<Todo> {
  const response = await fetch(`${API_URL}/todos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(todoData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || "Failed to create todo"
    );
  }

  return data;
}
