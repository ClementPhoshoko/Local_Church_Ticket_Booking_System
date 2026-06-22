import { useState, useEffect } from 'react'
import { adminApi } from '../services/api'

export function useAdminUser(userId) {
  const [user, setUser] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) return

    const fetchUser = async () => {
      try {
        setLoading(true)
        const data = await adminApi.getUser(userId)
        setUser(data.user)
        setTickets(data.tickets || [])
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  return { user, tickets, loading, error }
}
