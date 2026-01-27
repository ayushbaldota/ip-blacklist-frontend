import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://blacklistapi.atoztester.com/api/v1'

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for API key
client.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem('api_key')
  if (apiKey) {
    config.headers['X-API-Key'] = apiKey
  }
  return config
})

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
    if (error.response?.status === 401) {
      // Handle unauthorized - could redirect to login or show modal
      console.error('Unauthorized - API key may be invalid')
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
  getIPHistory: (id, params = {}) => client.get(`/ips/${id}/history`, { params }).then(res => res.data),

  // Stats
  getStats: () => client.get('/stats').then(res => res.data),
  getActivity: (params = {}) => client.get('/activity', { params }).then(res => res.data),

  // Settings
  testWebhook: () => client.post('/webhook/test').then(res => res.data),
}

export default client
