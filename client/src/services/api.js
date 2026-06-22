import { supabase } from './supabase'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function getFriendlyErrorMessage(errorMessage) {
  const errorMap = {
    'Server configuration error': 'Server configuration error. Please check with your administrator.',
    'Requested resource not found': 'Requested resource not found.',
    'Invalid ticket status': 'Invalid ticket status.',
    'Ticket not found': 'Ticket not found.',
    'User not found': 'User not found.',
    'Invalid API key': 'Server configuration error. Please check with your administrator.',
    'not found': 'Requested resource not found.'
  }
  
  for (const key in errorMap) {
    if (errorMessage && errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return errorMap[key]
    }
  }
  
  return errorMessage || 'Something went wrong. Please try again later.'
}

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
  try {
    const url = `${API_BASE_URL}${endpoint}`
    const headers = await getHeaders()
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    })
    
    let data
    try {
      data = await response.json()
    } catch (parseError) {
      data = null
    }
    
    if (!response.ok) {
      const errorMsg = data?.error || `Request failed with status ${response.status}`
      throw new Error(getFriendlyErrorMessage(errorMsg))
    }
    
    return data
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to server. Please check your connection.')
    }
    throw error
  }
}

// Profile
export const profileApi = {
  me: () => apiRequest('/profile/me'),
  update: (data) => apiRequest('/profile', { method: 'PATCH', body: JSON.stringify(data) })
}

// Tickets
export const ticketsApi = {
  list: () => apiRequest('/tickets'),
  get: (id) => apiRequest(`/tickets/${id}`),
  create: (planId) => apiRequest('/tickets', { method: 'POST', body: JSON.stringify({ plan_id: planId }) }),
  cancel: (id) => apiRequest(`/tickets/${id}/cancel`, { method: 'PATCH' })
}

// Payments
export const paymentsApi = {
  initiate: (ticketId, gateway = 'mock') => apiRequest('/payments/initiate', { 
    method: 'POST', 
    body: JSON.stringify({ ticket_id: ticketId, gateway }) 
  }),
  get: (ticketId) => apiRequest(`/payments/${ticketId}`)
}

// Notifications
export const notificationsApi = {
  list: () => apiRequest('/notifications'),
  markRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PATCH' })
}

// Admin
export const adminApi = {
  getBookings: (page = 1, limit = 20) => apiRequest(`/admin/bookings?page=${page}&limit=${limit}`),
  getUsers: (page = 1, limit = 20) => apiRequest(`/admin/users?page=${page}&limit=${limit}`),
  getUser: (id) => apiRequest(`/admin/users/${id}`),
  setTicketStatus: (id, status) => apiRequest(`/admin/tickets/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  getAuditLogs: (page = 1, limit = 20) => apiRequest(`/admin/audit-logs?page=${page}&limit=${limit}`),
  getAuditLogsByTable: (table, page = 1, limit = 20) => apiRequest(`/admin/audit-logs/table/${table}?page=${page}&limit=${limit}`),
  getAuditLogsByUser: (userId, page = 1, limit = 20) => apiRequest(`/admin/audit-logs/user/${userId}?page=${page}&limit=${limit}`),
  getPlans: () => apiRequest('/admin/plans')
}

// Plans
export const plansApi = {
  list: () => apiRequest('/plans'),
  get: (id) => apiRequest(`/plans/${id}`),
  create: (data) => apiRequest('/plans', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiRequest(`/plans/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiRequest(`/plans/${id}`, { method: 'DELETE' })
}
