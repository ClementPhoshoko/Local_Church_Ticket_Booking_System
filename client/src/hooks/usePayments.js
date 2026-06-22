import { useState, useEffect } from 'react'
import { paymentsApi } from '../services/api'

export function usePayments(ticketId) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTransactions = async () => {
    if (!ticketId) return
    try {
      setLoading(true)
      setError(null)
      const data = await paymentsApi.get(ticketId)
      setTransactions(data.transactions || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (ticketId) {
      fetchTransactions()
    }
  }, [ticketId])

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    initiate: async (ticketId, gateway) => {
      const result = await paymentsApi.initiate(ticketId, gateway)
      fetchTransactions()
      return result
    }
  }
}
