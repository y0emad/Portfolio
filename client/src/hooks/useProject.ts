import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { api } from '../lib/api'
import type { Project, ProjectResponse } from '../types'

export function useProject(slug: string) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['projects', slug],
    queryFn: async () => (await api.get<ProjectResponse>(`/projects/${slug}`)).data.project,
    placeholderData: () => queryClient.getQueryData<Project[]>(['projects'])?.find((p) => p.slug === slug),
    retry: (count, error) => !(axios.isAxiosError(error) && error.response?.status === 404) && count < 1,
  })
}
