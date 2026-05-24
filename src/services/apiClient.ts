import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useUserStore } from '@/stores/user'

const apiBaseUrl = (import.meta.env.VITE_APP_API || '').replace(/\/$/, '')
const versionedApiBaseUrl = apiBaseUrl.endsWith('/api/v1') ? apiBaseUrl : `${apiBaseUrl}/api/v1`

export const apiClient = axios.create({
  baseURL: versionedApiBaseUrl
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const userStore = useUserStore()
  const authHeader = userStore.authHeader

  if (authHeader) {
    config.headers.Authorization = authHeader
  }

  return config
})

export function isUnauthorizedError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong.') {
  if (axios.isAxiosError(error)) {
    return (
      getStringMessage(error.response?.data) ||
      error.response?.statusText ||
      error.message ||
      fallback
    )
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

export function isCanceledRequest(error: unknown) {
  return axios.isCancel(error) || (error instanceof AxiosError && error.code === 'ERR_CANCELED')
}

function getStringMessage(value: unknown) {
  if (typeof value === 'string') return value

  if (value && typeof value === 'object' && 'message' in value) {
    const message = (value as { message?: unknown }).message
    return typeof message === 'string' ? message : null
  }

  return null
}
