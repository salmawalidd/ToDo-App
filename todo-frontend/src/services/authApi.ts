const API_URL = "http://localhost:3001/api";

export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  created_at?: string;
  updated_at?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface MessageResponse {
  message: string;
}

interface ApiErrorResponse {
  error?: {
    message?: string;
    code?: string;
  };
  message?: string;
}

async function readResponse<T>(
  response: Response
): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

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

export async function register(
  registerData: RegisterData
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(registerData),
  });

  return readResponse<AuthResponse>(response);
}

export async function login(
  loginData: LoginData
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(loginData),
  });

  return readResponse<AuthResponse>(response);
}

export async function forgotPassword(
  email: string
): Promise<MessageResponse> {
  const response = await fetch(
    `${API_URL}/forgot-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
      }),
    }
  );

  return readResponse<MessageResponse>(response);
}

export async function logout(): Promise<void> {
  const token = localStorage.getItem("token");

  if (!token) {
    return;
  }

  const response = await fetch(`${API_URL}/logout`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  await readResponse<void>(response);
}
