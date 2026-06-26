import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/services/supabase'
import { adminApi } from '@/services/api'
import { useAdminBookings } from '@/hooks'
import HeroImage from '@/assets/Community_gathering_outside_the_church.png'
import Bookings from './tabs/Bookings'
import Users from './tabs/Users'
import Plans from './tabs/Plans'
import Audits from './tabs/Audits'
import './Admin.css'

function Admin() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('bookings')
  const { refetch: refetchBookings } = useAdminBookings()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleStatusChange = async (ticketUuid, status) => {
    try {
      await adminApi.setTicketStatus(ticketUuid, status)
      await refetchBookings()
    } catch (err) {
      console.error('Failed to update ticket status:', err)
    }
  }

  return (
    <div className="admin-container">
      {/* Hero Section */}
      <div className="admin-hero">
        <img src={HeroImage} alt="Community Gathering" className="admin-hero-image" />
        <div className="admin-header">
          <h1>Signed in as Admin</h1>
          <button className="sign-out-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          Bookings
        </button>
        <button 
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`admin-tab ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          Plans
        </button>
        <button 
          className={`admin-tab ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          Audit Logs
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'bookings' && <Bookings onStatusChange={handleStatusChange} />}
        {activeTab === 'users' && <Users />}
        {activeTab === 'plans' && <Plans />}
        {activeTab === 'audit' && <Audits />}
      </div>
    </div>
  )
}

export default Admin
