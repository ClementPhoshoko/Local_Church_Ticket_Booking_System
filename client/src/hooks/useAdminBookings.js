import { useState, useEffect } from 'react'
import { adminApi } from '../services/api'

export function useAdminBookings(page = 1, limit = 20) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 20 })

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const data = await adminApi.getBookings(page, limit)
        setBookings(data.bookings || [])
        setPagination(data.pagination || { page, limit })
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [page, limit])

  return { bookings, loading, error, pagination, refetch: () => adminApi.getBookings(page, limit) }
}
