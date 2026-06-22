import { useState, useEffect } from 'react'
import { notificationsApi } from '../services/api'

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await notificationsApi.list()
      setNotifications(data.notifications || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  return {
    notifications,
    loading,
    error,
    refetch: fetchNotifications,
    markRead: async (id) => {
      await notificationsApi.markRead(id)
      fetchNotifications()
    }
  }
}
