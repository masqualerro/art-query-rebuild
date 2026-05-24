import { apiClient } from './apiClient'
import type { newUser, userObject } from '@/interfaces/user.interface'

interface AuthResponse {
  token: string
  user: userObject
}

interface LoginPayload {
  email: string
  password: string
}

export async function login(payload: LoginPayload) {
  const response = await apiClient.post<AuthResponse>('/auth/login', payload)
  return response.data
}

export async function register(payload: newUser) {
  const response = await apiClient.post<{ user: userObject }>('/auth/register', payload)
  return response.data
}

export async function getAuthenticatedUser() {
  const response = await apiClient.get<{ user: userObject }>('/auth/me')
  return response.data.user
}
