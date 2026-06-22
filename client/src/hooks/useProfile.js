import { useState, useEffect } from 'react'
import { profileApi } from '../services/api'

export function useProfile() {
  const [profile, setProfile] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await profileApi.me()
      setProfile(data.profile || null)
      setUser(data.user || null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  return {
    profile,
    user,
    loading,
    error,
    refetch: fetchProfile,
    update: async (data) => {
      const result = await profileApi.update(data)
      if (result.profile) {
        setProfile(result.profile)
      }
      return result
    }
  }
}
