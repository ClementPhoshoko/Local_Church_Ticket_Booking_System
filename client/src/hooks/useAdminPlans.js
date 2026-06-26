import { useState, useEffect } from 'react'
import { adminApi, plansApi } from '../services/api'

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

  const createPlan = async (planData) => {
    try {
      await plansApi.create(planData)
      await fetchPlans()
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updatePlan = async (planId, planData) => {
    try {
      await plansApi.update(planId, planData)
      await fetchPlans()
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const deactivatePlan = async (planId) => {
    try {
      await updatePlan(planId, { is_active: false })
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  return {
    plans,
    loading,
    error,
    createPlan,
    updatePlan,
    deactivatePlan,
    refetch: fetchPlans
  }
}