import { useState, useEffect } from 'react'
import { adminApi } from '../services/api'

export function useAdminPlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPlans = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminApi.getPlans()
      setPlans(data.plans || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans
  }
}