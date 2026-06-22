import { useState, useEffect } from 'react'
import { adminApi } from '../services/api'

export function useAdminAuditLogsByUser(userId, page = 1, limit = 20) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })

  const fetchLogs = async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const data = await adminApi.getAuditLogsByUser(userId, page, limit)
      setLogs(data.logs)
      setPagination(data.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [userId, page, limit])

  return {
    logs,
    loading,
    error,
    pagination,
    refetch: fetchLogs
  }
}
