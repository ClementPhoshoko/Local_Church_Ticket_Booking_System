import { useState, useEffect } from 'react'
import { ticketsApi } from '../services/api'

export function useTickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTickets = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ticketsApi.list()
      setTickets(data.tickets || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  return {
    tickets,
    loading,
    error,
    refetch: fetchTickets,
    create: ticketsApi.create,
    get: ticketsApi.get,
    cancel: ticketsApi.cancel
  }
}
