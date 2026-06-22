import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loading from './loading/Loading'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loading isVisible={true} message="Checking authentication..." />
  }

  if (!user) {
    return <Navigate to="/unauthenticated" replace />
  }

  return children
}

export default RequireAuth
