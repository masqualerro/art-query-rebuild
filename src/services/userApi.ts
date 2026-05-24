import { apiClient } from './apiClient'
import type { userObject } from '@/interfaces/user.interface'

interface UpdateProfilePayload {
  email: string
  name: string
  age: number | string
  color: string
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const response = await apiClient.patch<{ user: userObject }>('/users/me', payload)
  return response.data.user
}
