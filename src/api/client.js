/**
 * API Client for IP Blacklist Monitor
 *
 * Service URLs:
 * - Frontend: https://blacklistpage.atoztester.com
 * - Backend API: https://blacklistapi.atoztester.com/api/v1
 *
 * Authentication: API key via X-API-Key header
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
    indexes: null, // This makes arrays serialize as ip_ids=1&ip_ids=2 instead of ip_ids[]=1
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
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Clear invalid credentials and redirect to login
      localStorage.removeItem(API_KEY_STORAGE)
      sessionStorage.removeItem('blacklist_auth')

      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } else if (error.response?.status === 429) {
      console.warn('Rate limit exceeded. Please wait before making more requests.')
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - the server took too long to respond')
    }

    return Promise.reject(error)
  }
)

// API Functions
export const api = {
  // Health
  getHealth: () => client.get('/health').then(res => res.data),

  // IPs
  getIPs: (params = {}) => client.get('/ips', { params }).then(res => res.data),
  getIP: (id) => client.get(`/ips/${id}`).then(res => res.data),
  addIP: (data) => client.post('/ips', data).then(res => res.data),
  addBulkIPs: (data) => client.post('/ips/bulk', data).then(res => res.data),
  deleteIP: (id) => client.delete(`/ips/${id}`).then(res => res.data),
  updateIP: (id, data) => client.patch(`/ips/${id}`, data).then(res => res.data),
  checkIP: (id) => client.post(`/ips/${id}/check`).then(res => res.data),
  bulkCheckIPs: (ids) => {
    const params = ids.map(id => `ip_ids=${id}`).join('&')
    return client.post(`/ips/bulk-check?${params}`).then(res => res.data)
  },
  getIPHistory: (id, params = {}) => client.get(`/ips/${id}/history`, { params }).then(res => res.data),

  // Stats
  getStats: () => client.get('/stats').then(res => res.data),
  getActivity: (params = {}) => client.get('/activity', { params }).then(res => res.data),

  // Settings
  testWebhook: () => client.post('/webhook/test').then(res => res.data),
}

export default client
