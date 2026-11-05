import axios from 'axios'

export const api = axios.create({ baseURL: '/api' })

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ msg?: string }>(error)) {
    return error.response?.data?.msg ?? 'Could not reach the server, please try again'
  }
  return 'Something went wrong, please try again'
}
