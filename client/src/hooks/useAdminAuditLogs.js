import { useState, useEffect } from 'react'
import { adminApi } from '../services/api'

export function useAdminAuditLogs(page = 1, limit = 20) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })

  const fetchLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminApi.getAuditLogs(page, limit)
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
  }, [page, limit])

  return {
    logs,
    loading,
    error,
    pagination,
    refetch: fetchLogs
  }
}
