import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
    refetchInterval: 60000, // Refresh every minute
  })
}

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: api.getHealth,
    refetchInterval: 30000,
  })
}
