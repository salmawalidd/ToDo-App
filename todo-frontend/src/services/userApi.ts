export interface AdminUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
  direct_permissions: string[];
  permissions: string[];
  created_at: string;
  updated_at?: string;
}

export interface AccessOptions {
  roles: string[];
  permissions: string[];
}

export interface UpdateUserAccessData {
  roles: string[];
  permissions: string[];
}

interface UpdateUserAccessResponse {
  message: string;
  user: AdminUser;
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

export async function getAccessOptions(): Promise<AccessOptions> {
  const response = await fetch(
    `${API_URL}/roles-permissions`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  return readJson<AccessOptions>(response);
}

export async function updateUserAccess(
  userId: number,
  accessData: UpdateUserAccessData
): Promise<AdminUser> {
  const response = await fetch(
    `${API_URL}/users/${userId}/access`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(accessData),
    }
  );

  const data =
    await readJson<UpdateUserAccessResponse>(response);

  return data.user;
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
