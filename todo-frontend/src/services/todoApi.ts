import type {
  CreateTodoData,
  Todo,
  UpdateTodoData,
} from "../types/todo";

const API_URL = "http://localhost:3001/api";

interface ApiErrorResponse {
  error?: {
    message?: string;
    code?: string;
  };
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    const errorData = data as ApiErrorResponse;

    throw new Error(
      errorData.error?.message || "Something went wrong."
    );
  }

  return data as T;
}

export async function getTodos(
  completed?: boolean
): Promise<Todo[]> {
  const query =
    completed === undefined
      ? ""
      : `?completed=${completed}`;

  const response = await fetch(
    `${API_URL}/todos${query}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  return readJsonResponse<Todo[]>(response);
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

  return readJsonResponse<Todo>(response);
}

export async function updateTodo(
  todoId: number,
  todoData: UpdateTodoData
): Promise<Todo> {
  const response = await fetch(
    `${API_URL}/todos/${todoId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(todoData),
    }
  );

  return readJsonResponse<Todo>(response);
}

export async function deleteTodo(
  todoId: number
): Promise<void> {
  const response = await fetch(
    `${API_URL}/todos/${todoId}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (response.status === 204) {
    return;
  }

  let message = "Failed to delete todo.";

  try {
    const data = (await response.json()) as ApiErrorResponse;
    message = data.error?.message || message;
  } catch {
    // The response did not contain JSON.
  }

  throw new Error(message);
}
