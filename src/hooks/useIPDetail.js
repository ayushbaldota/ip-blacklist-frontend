import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

/**
 * Hook to fetch a single IP by its address
 * @param {string} ipAddress - The IP address to fetch
 */
export function useIP(ipAddress) {
  return useQuery({
    queryKey: ['ip', ipAddress],
    queryFn: () => api.getIP(ipAddress),
    enabled: !!ipAddress,
  })
}

/**
 * Hook to fetch check history for an IP
 * @param {string} ipAddress - The IP address to fetch history for
 * @param {object} params - Query parameters (limit, page, etc.)
 */
export function useIPHistory(ipAddress, params = {}) {
  return useQuery({
    queryKey: ['ip-history', ipAddress, params],
    queryFn: () => api.getIPHistory(ipAddress, params),
    enabled: !!ipAddress,
  })
}
