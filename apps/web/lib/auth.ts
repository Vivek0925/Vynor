import { api } from "./api";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit,
): Promise<T> {
  return api<T>(endpoint, options);
}

export function register(data: RegisterPayload) {
  return request<{ message: string; email: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function verifyRegistration(data: { email: string; otp: string }) {
  return request<{ message: string }>("/auth/register/verify", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function resendRegistration(email: string) {
  return request<{ message: string }>("/auth/register/resend", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function login(data: LoginPayload) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export function getCurrentUser() {
  return request<CurrentUser>("/auth/me", {
    method: "GET",
  });
}