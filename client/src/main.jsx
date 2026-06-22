import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './design_tokens.css'
import './index.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import Unauthenticated from './pages/unauthenticated/Unauthenticated'
import Landing from './pages/landing/Landing'
import Admin from './pages/admin/Admin'
import AuthLayout from './pages/auth/AuthLayout'
import RequireAuth from './components/RequireAuth'
import RequireAdmin from './components/RequireAdmin'
import Loading from './components/loading/Loading'

function RootRedirect() {
  const { user, role, loading } = useAuth()

  if (loading) {
    return <Loading isVisible={true} message="Loading..." />
  }

  if (user) {
    // Redirect authenticated users based on role
    return role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/landing" replace />
  }

  // Show login form
  return <AuthLayout />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/unauthenticated" element={<Unauthenticated />} />
          <Route path="/landing" element={<RequireAuth><Landing /></RequireAuth>} />
          <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
