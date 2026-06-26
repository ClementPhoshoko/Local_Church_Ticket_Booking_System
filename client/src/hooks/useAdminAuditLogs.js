import { useState, useEffect } from 'react'
import { adminApi } from '../services/api'

export function useAdminAuditLogs(page = 1, limit = 20) {
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })

  const fetchLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminApi.getAuditLogs(page, limit)
      setAuditLogs(data.logs || [])
      setPagination(data.pagination || { page, limit, total: 0 })
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
    auditLogs,
    loading,
    error,
    pagination,
    refetch: fetchLogs
  }
}
