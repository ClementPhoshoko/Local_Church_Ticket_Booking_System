import { useState, useEffect } from 'react'
import { adminApi } from '../services/api'

export function useAdminUsers(page = 1, limit = 20) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 20 })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getUsers(page, limit)
      setUsers(data.users || [])
      setPagination(data.pagination || { page, limit })
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, limit])

  return { users, loading, error, pagination, refetch: fetchUsers }
}
