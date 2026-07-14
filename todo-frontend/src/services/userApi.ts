export interface AdminUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
  created_at: string;
}

interface ApiErrorResponse {
  error?: {
    message?: string;
    code?: string;
  };
  message?: string;
}

const API_URL = "http://localhost:3001/api";

function getToken(): string {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("You are not authenticated.");
  }

  return token;
}

async function readJson<T>(
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

export async function getUsers(): Promise<AdminUser[]> {
  const response = await fetch(`${API_URL}/users`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return readJson<AdminUser[]>(response);
}

export async function deleteUser(
  userId: number
): Promise<void> {
  const response = await fetch(
    `${API_URL}/users/${userId}`,
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

  await readJson<unknown>(response);
}
