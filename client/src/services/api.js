import { supabase } from './supabase'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function getHeaders() {
  const { data } = await supabase.auth.getSession()
  const session = data?.session
  const headers = {
    'Content-Type': 'application/json'
  }
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }
  
  return headers
}

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = await getHeaders()
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong')
  }
  
  return data
}

// Auth
export const authApi = {
  signUp: (data) => apiRequest('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getProfile: () => apiRequest('/auth/me'),
  updateProfile: (data) => apiRequest('/auth/me', { method: 'PATCH', body: JSON.stringify(data) })
}

// Plans
export const plansApi = {
  list: () => apiRequest('/plans'),
  get: (id) => apiRequest(`/plans/${id}`),
  create: (data) => apiRequest('/plans', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/plans/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

// Tickets
export const ticketsApi = {
  list: () => apiRequest('/tickets'),
  get: (id) => apiRequest(`/tickets/${id}`),
  create: (data) => apiRequest('/tickets', { method: 'POST', body: JSON.stringify(data) }),
  cancel: (id) => apiRequest(`/tickets/${id}/cancel`, { method: 'PATCH' })
}

// Admin
export const adminApi = {
  getBookings: (page = 1, limit = 20) => apiRequest(`/admin/bookings?page=${page}&limit=${limit}`),
  getUsers: (page = 1, limit = 20) => apiRequest(`/admin/users?page=${page}&limit=${limit}`),
  getUser: (id) => apiRequest(`/admin/users/${id}`),
  setTicketStatus: (id, status) => apiRequest(`/admin/tickets/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getAuditLogs: (page = 1, limit = 20) => apiRequest(`/admin/audit?page=${page}&limit=${limit}`),
  getAuditLogsByTable: (table, page = 1, limit = 20) => apiRequest(`/admin/audit/${table}?page=${page}&limit=${limit}`),
  getAuditLogsByUser: (userId, page = 1, limit = 20) => apiRequest(`/admin/audit/user/${userId}?page=${page}&limit=${limit}`)
}
