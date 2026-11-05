import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { SkillsResponse } from '../types'

export function useSkills() {
  return useQuery({
    queryKey: ['skills'],
    queryFn: async () => (await api.get<SkillsResponse>('/skills')).data.skills,
  })
}
