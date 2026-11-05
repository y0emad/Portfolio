import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { Health } from '../types'

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const start = performance.now()
      const res = await axios.get<Health>('/health', { validateStatus: (s) => s === 200 || s === 503 })
      return { ...res.data, responseMs: Math.round(performance.now() - start) }
    },
    refetchInterval: 15_000,
    staleTime: 0,
  })
}
