/**
 * API Client for IP Blacklist Monitor
 *
 * Service URLs:
 * - Frontend: https://blacklistpage.atoztester.com
 * - Backend API: https://blacklistapi.atoztester.com/api/v1
 *
 * Authentication: API key via X-API-Key header
 *
 * Note: API uses ip_address as the identifier (not numeric ID)
 */
import axios from 'axios'

// Backend API URL - configured via environment variable
// Production: https://blacklistapi.atoztester.com/api/v1
const API_URL = import.meta.env.VITE_API_URL || 'https://blacklistapi.atoztester.com/api/v1'

// Request timeout in milliseconds (30 seconds)
const REQUEST_TIMEOUT = 30000

// Storage key for API key
const API_KEY_STORAGE = 'api_key'

const client = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    indexes: null, // This makes arrays serialize as ip_addresses=1.2.3.4&ip_addresses=5.6.7.8
  },
})

// Request interceptor for API key
client.interceptors.request.use(
  (config) => {
    const apiKey = localStorage.getItem(API_KEY_STORAGE)
    if (apiKey) {
      config.headers['X-API-Key'] = apiKey
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and data unwrapping
client.interceptors.response.use(
  (response) => {
    // Unwrap the 'data' property from API responses
    if (response.data && response.data.data !== undefined) {
      response.data = response.data.data
    }
    return response
  },
  (error) => {
    // Enhance error with user-friendly message
    const enhanceError = (message) => {
      error.userMessage = message
      return error
    }

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Clear invalid credentials and redirect to login
      localStorage.removeItem(API_KEY_STORAGE)
      sessionStorage.removeItem('blacklist_auth')

      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      return Promise.reject(enhanceError('Authentication failed. Please log in again.'))
    }

    if (error.response?.status === 403) {
      return Promise.reject(enhanceError('You do not have permission to perform this action.'))
    }

    if (error.response?.status === 404) {
      return Promise.reject(enhanceError('The requested resource was not found.'))
    }

    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded. Please wait before making more requests.')
      return Promise.reject(enhanceError('Too many requests. Please wait a moment and try again.'))
    }

    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data)
      return Promise.reject(enhanceError('Server error. Please try again later.'))
    }

    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - the server took too long to respond')
      return Promise.reject(enhanceError('Request timed out. Please check your connection and try again.'))
    }

    if (!error.response) {
      // Network error - no response received
      console.error('Network error:', error.message)
      return Promise.reject(enhanceError('Network error. Please check your internet connection.'))
    }

    return Promise.reject(error)
  }
)

// API Functions
// Note: All IP-specific endpoints use ip_address (string) as the identifier
export const api = {
  // Health
  getHealth: () => client.get('/health').then(res => res.data),

  // IPs - use ip_address as identifier
  getIPs: (params = {}) => client.get('/ips', { params }).then(res => res.data),
  getIP: (ipAddress) => client.get(`/ips/${encodeURIComponent(ipAddress)}`).then(res => res.data),
  addIP: (data) => client.post('/ips', data).then(res => res.data),
  addBulkIPs: (data) => client.post('/ips/bulk', data).then(res => res.data),
  deleteIP: (ipAddress) => client.delete(`/ips/${encodeURIComponent(ipAddress)}`).then(res => res.data),
  updateIP: (ipAddress, data) => client.patch(`/ips/${encodeURIComponent(ipAddress)}`, data).then(res => res.data),
  checkIP: (ipAddress) => client.post(`/ips/${encodeURIComponent(ipAddress)}/check`).then(res => res.data),
  bulkCheckIPs: (ipAddresses) => {
    const params = ipAddresses.map(ip => `ip_addresses=${encodeURIComponent(ip)}`).join('&')
    return client.post(`/ips/bulk-check?${params}`).then(res => res.data)
  },
  getIPHistory: (ipAddress, params = {}) => client.get(`/ips/${encodeURIComponent(ipAddress)}/history`, { params }).then(res => res.data),

  // Notification muting
  muteIP: (ipAddress) => client.post(`/ips/${encodeURIComponent(ipAddress)}/mute`).then(res => res.data),
  unmuteIP: (ipAddress) => client.post(`/ips/${encodeURIComponent(ipAddress)}/unmute`).then(res => res.data),

  // Check-all job endpoints (background processing)
  startCheckAll: () => client.post('/ips/check-all').then(res => res.data),
  getCurrentCheckJob: () => client.get('/ips/check-all/current').then(res => res.data),
  getCheckAllStatus: (jobId) => client.get(`/ips/check-all/${encodeURIComponent(jobId)}/status`).then(res => res.data),
  cancelCheckAll: (jobId) => client.post(`/ips/check-all/${encodeURIComponent(jobId)}/cancel`).then(res => res.data),

  // Stats
  getStats: () => client.get('/stats').then(res => res.data),
  getActivity: (params = {}) => client.get('/activity', { params }).then(res => res.data),

  // Settings
  testWebhook: () => client.post('/webhook/test').then(res => res.data),
}

export default client
