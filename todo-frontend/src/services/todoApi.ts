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
  message?: string;
}

function getToken(): string {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("You are not authenticated.");
  }

  return token;
}

async function readJsonResponse<T>(
  response: Response
): Promise<T> {
  const contentType = response.headers.get(
    "content-type"
  );

  let data: unknown = null;

  if (contentType?.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    const errorData = data as ApiErrorResponse | null;

    throw new Error(
      errorData?.error?.message ||
        errorData?.message ||
        `Request failed with status ${response.status}.`
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
        Authorization: `Bearer ${getToken()}`,
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
      Authorization: `Bearer ${getToken()}`,
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
        Authorization: `Bearer ${getToken()}`,
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
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  if (response.status === 204) {
    return;
  }

  await readJsonResponse<unknown>(response);
}
