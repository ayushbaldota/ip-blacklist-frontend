import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

export function useIP(id) {
  return useQuery({
    queryKey: ['ip', id],
    queryFn: () => api.getIP(id),
    enabled: !!id,
  })
}

export function useIPHistory(id, params = {}) {
  return useQuery({
    queryKey: ['ip-history', id, params],
    queryFn: () => api.getIPHistory(id, params),
    enabled: !!id,
  })
}
