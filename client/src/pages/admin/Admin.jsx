import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'
import { adminApi } from '../../services/api'
import { useAdminBookings, useAdminUsers } from '../../hooks/index.js'
import Loading from '../../components/loading/Loading'
import './Admin.css'

function Admin() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('bookings')
  const { bookings, loading: bookingsLoading, error: bookingsError } = useAdminBookings()
  const { users, loading: usersLoading, error: usersError } = useAdminUsers()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleStatusChange = async (ticketId, status) => {
    try {
      await adminApi.setTicketStatus(ticketId, status)
      // Refresh the bookings list
      window.location.reload()
    } catch (err) {
      alert('Failed to update ticket status: ' + err.message)
    }
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard 👑</h1>
        <button className="sign-out-btn" onClick={handleSignOut}>
          Sign Out
        </button>
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
      </div>

      <div className="admin-content">
        {activeTab === 'bookings' && (
          <div>
            <h2>All Bookings</h2>
            {bookingsLoading && <Loading isVisible={true} message="Loading bookings..." />}
            {bookingsError && <p className="error-message">{bookingsError}</p>}
            {!bookingsLoading && !bookingsError && (
              <div className="bookings-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Plan</th>
                      <th>Status</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>{booking.id.substring(0, 8)}...</td>
                        <td>{booking.profiles?.first_name} {booking.profiles?.last_name}</td>
                        <td>{booking.ticket_plans?.name}</td>
                        <td>
                          <span className={`status-badge status-${booking.status}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td>{new Date(booking.created_at).toLocaleString()}</td>
                        <td>
                          <select
                            value={booking.status}
                            onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="refunded">Refunded</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2>All Users</h2>
            {usersLoading && <Loading isVisible={true} message="Loading users..." />}
            {usersError && <p className="error-message">{usersError}</p>}
            {!usersLoading && !usersError && (
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Email</th>
                      <th>Contact Number</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id.substring(0, 8)}...</td>
                        <td>{user.first_name}</td>
                        <td>{user.last_name}</td>
                        <td>{user.email}</td>
                        <td>{user.contact_number}</td>
                        <td>{new Date(user.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin
