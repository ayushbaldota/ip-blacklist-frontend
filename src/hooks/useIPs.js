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
      queryClient.invalidateQueries({ queryKey: ['activity'] })
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
      queryClient.invalidateQueries({ queryKey: ['activity'] })
    },
  })
}

export function useBulkAddIPs() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.addBulkIPs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ips'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
    },
  })
}

export function useUpdateIP() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => api.updateIP(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ips'] })
      queryClient.invalidateQueries({ queryKey: ['ip', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
    },
  })
}

export function useCheckIP() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => api.checkIP(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['ip', id] })
      queryClient.invalidateQueries({ queryKey: ['ip-history', id] })
      queryClient.invalidateQueries({ queryKey: ['ips'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
    },
  })
}

export function useActivity(params = {}) {
  return useQuery({
    queryKey: ['activity', params],
    queryFn: () => api.getActivity(params),
    refetchInterval: 30000,
  })
}
