import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'

export function useIPs(params = {}) {
  return useQuery({
    queryKey: ['ips', params],
    queryFn: () => api.getIPs(params),
    keepPreviousData: true,
  })
}

export function useDeleteIP() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => api.deleteIP(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ips'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useAddIP() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.addIP,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ips'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}
