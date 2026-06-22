import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loading from './loading/Loading'

function RequireAdmin({ children }) {
  const { user, loading, role } = useAuth()

  if (loading) {
    return <Loading isVisible={true} message="Checking admin access..." />
  }

  if (!user) {
    return <Navigate to="/unauthenticated" replace />
  }

  if (role !== 'admin') {
    return <Navigate to="/landing" replace />
  }

  return children
}

export default RequireAdmin
