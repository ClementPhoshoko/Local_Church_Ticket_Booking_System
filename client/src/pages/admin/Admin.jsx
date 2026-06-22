import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'
import './Admin.css'

function Admin() {
  const { user } = useAuth()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Admin Dashboard 👑</h1>
      <p>Hello Admin, {user?.email}!</p>
      <button 
        onClick={handleSignOut} 
        style={{
          padding: '0.5rem 1rem',
          marginTop: '1rem',
          cursor: 'pointer'
        }}
      >
        Sign Out
      </button>
    </div>
  )
}

export default Admin
