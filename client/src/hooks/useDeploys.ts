import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { DeploysResponse } from '../types'

export function useDeploys() {
  return useQuery({
    queryKey: ['deploys'],
    queryFn: async () => (await api.get<DeploysResponse>('/deploys')).data.deploys,
  })
}
