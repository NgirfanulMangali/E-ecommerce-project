export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  data: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ApiError {
  message: string;
  statusCode?: number;
}