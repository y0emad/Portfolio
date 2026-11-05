import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { ProjectsResponse } from '../types'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get<ProjectsResponse>('/projects')).data.projects,
  })
}
