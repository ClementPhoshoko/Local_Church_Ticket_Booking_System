import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'
import { adminApi, plansApi } from '../../services/api'
import { 
  useAdminBookings, 
  useAdminUsers, 
  useAdminPlans, 
  useAdminAuditLogs 
} from '../../hooks/index.js'
import Loading from '../../components/loading/Loading'
import HeroImage from '../../assets/Community_gathering_outside_the_church.png'
import './Admin.css'

function Admin() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('bookings')
  const [retryKey, setRetryKey] = useState(0)
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'ZAR',
    is_active: true
  })

  const { bookings, loading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useAdminBookings()
  const { users, loading: usersLoading, error: usersError } = useAdminUsers()
  const { plans, loading: plansLoading, error: plansError, refetch: refetchPlans } = useAdminPlans()
  const { logs, loading: auditLoading, error: auditError } = useAdminAuditLogs()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleRetry = () => {
    setRetryKey(prev => prev + 1)
  }

  const handleStatusChange = async (ticketId, status) => {
    try {
      await adminApi.setTicketStatus(ticketId, status)
      refetchBookings()
    } catch (err) {
      alert('Failed to update ticket status: ' + err.message)
    }
  }

  const handlePlanFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setPlanForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handlePlanSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingPlan) {
        await plansApi.update(editingPlan.id, planForm)
      } else {
        await plansApi.create({
          ...planForm,
          price: parseFloat(planForm.price)
        })
      }
      setShowPlanForm(false)
      setEditingPlan(null)
      setPlanForm({
        name: '',
        description: '',
        price: '',
        currency: 'ZAR',
        is_active: true
      })
      refetchPlans()
    } catch (err) {
      alert('Failed to save plan: ' + err.message)
    }
  }

  const handleEditPlan = (plan) => {
    setEditingPlan(plan)
    setPlanForm({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      is_active: plan.is_active
    })
    setShowPlanForm(true)
  }

  const handleDeletePlan = async (planId) => {
    if (window.confirm('Are you sure you want to deactivate this plan?')) {
      try {
        await plansApi.delete(planId)
        refetchPlans()
      } catch (err) {
        alert('Failed to deactivate plan: ' + err.message)
      }
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
        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            <h2>All Bookings</h2>
            {bookingsLoading && <Loading isVisible={true} message="Loading bookings..." />}
            {bookingsError && (
              <div className="error-container">
                <p className="error-message">{bookingsError}</p>
                <button className="retry-btn" onClick={handleRetry}>
                  Try Again
                </button>
              </div>
            )}
            {!bookingsLoading && !bookingsError && (
              <div className="bookings-table">
                <table>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>User</th>
                      <th>Plan</th>
                      <th>Status</th>
                      <th>Booked At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="empty-state">No bookings found</td>
                      </tr>
                    ) : (
                      bookings.map((booking) => (
                        <tr key={booking.ticket_uuid}>
                          <td>{booking.unique_code}</td>
                          <td>{booking.first_name} {booking.last_name}</td>
                          <td>{booking.plan_name}</td>
                          <td>
                            <span className={`status-badge status-${booking.ticket_status}`}>
                              {booking.ticket_status}
                            </span>
                          </td>
                          <td>{new Date(booking.booked_at).toLocaleString()}</td>
                          <td>
                            <select
                              value={booking.ticket_status}
                              onChange={(e) => handleStatusChange(booking.ticket_uuid, e.target.value)}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="refunded">Refunded</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h2>All Users</h2>
            {usersLoading && <Loading isVisible={true} message="Loading users..." />}
            {usersError && (
              <div className="error-container">
                <p className="error-message">{usersError}</p>
                <button className="retry-btn" onClick={handleRetry}>
                  Try Again
                </button>
              </div>
            )}
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
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="empty-state">No users found</td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.id.substring(0, 8)}...</td>
                          <td>{user.first_name}</td>
                          <td>{user.last_name}</td>
                          <td>{user.email}</td>
                          <td>{user.contact_number}</td>
                          <td>{new Date(user.created_at).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div>
            <div className="section-header">
              <h2>Plans Management</h2>
              <button 
                className="primary-btn" 
                onClick={() => {
                  setEditingPlan(null)
                  setPlanForm({
                    name: '',
                    description: '',
                    price: '',
                    currency: 'ZAR',
                    is_active: true
                  })
                  setShowPlanForm(true)
                }}
              >
                + Add New Plan
              </button>
            </div>

            {showPlanForm && (
              <div className="plan-form-container">
                <h3>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h3>
                <form onSubmit={handlePlanSubmit} className="plan-form">
                  <div className="form-group">
                    <label>Plan Name</label>
                    <input
                      type="text"
                      name="name"
                      value={planForm.name}
                      onChange={handlePlanFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={planForm.description}
                      onChange={handlePlanFormChange}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Price</label>
                      <input
                        type="number"
                        name="price"
                        step="0.01"
                        value={planForm.price}
                        onChange={handlePlanFormChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Currency</label>
                      <select
                        name="currency"
                        value={planForm.currency}
                        onChange={handlePlanFormChange}
                      >
                        <option value="ZAR">ZAR</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group checkbox-group">
                    <input
                      type="checkbox"
                      name="is_active"
                      id="is_active"
                      checked={planForm.is_active}
                      onChange={handlePlanFormChange}
                    />
                    <label htmlFor="is_active">Active</label>
                  </div>
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="secondary-btn"
                      onClick={() => {
                        setShowPlanForm(false)
                        setEditingPlan(null)
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="primary-btn">
                      {editingPlan ? 'Update Plan' : 'Create Plan'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {plansLoading && <Loading isVisible={true} message="Loading plans..." />}
            {plansError && (
              <div className="error-container">
                <p className="error-message">{plansError}</p>
                <button className="retry-btn" onClick={handleRetry}>
                  Try Again
                </button>
              </div>
            )}
            {!plansLoading && !plansError && (
              <div className="plans-list">
                {plans.length === 0 ? (
                  <p className="empty-state">No plans found</p>
                ) : (
                  plans.map((plan) => (
                    <div key={plan.id} className="plan-card">
                      <div className="plan-info">
                        <div className="plan-name">
                          {plan.name}
                          <span className={`status-badge status-${plan.is_active ? 'confirmed' : 'cancelled'}`}>
                            {plan.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {plan.description && <p className="plan-desc">{plan.description}</p>}
                        <div className="plan-price">
                          {plan.currency} {plan.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="plan-actions">
                        <button 
                          className="secondary-btn small-btn"
                          onClick={() => handleEditPlan(plan)}
                        >
                          Edit
                        </button>
                        {plan.is_active && (
                          <button 
                            className="danger-btn small-btn"
                            onClick={() => handleDeletePlan(plan.id)}
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <div>
            <h2>Audit Logs</h2>
            {auditLoading && <Loading isVisible={true} message="Loading audit logs..." />}
            {auditError && (
              <div className="error-container">
                <p className="error-message">{auditError}</p>
                <button className="retry-btn" onClick={handleRetry}>
                  Try Again
                </button>
              </div>
            )}
            {!auditLoading && !auditError && (
              <div className="audit-table">
                <table>
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Table</th>
                      <th>Record ID</th>
                      <th>Changed By</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty-state">No audit logs found</td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id}>
                          <td>
                            <span className={`status-badge status-${log.action === 'INSERT' ? 'confirmed' : log.action === 'UPDATE' ? 'pending' : 'cancelled'}`}>
                              {log.action}
                            </span>
                          </td>
                          <td>{log.table_name}</td>
                          <td>{log.record_id.substring(0, 8)}...</td>
                          <td>{log.changed_by ? log.changed_by.substring(0, 8) + '...' : 'System'}</td>
                          <td>{new Date(log.changed_at).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
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
