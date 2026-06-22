import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'
import { usePlans, useTickets } from '../../hooks'
import { useProfile } from '../../hooks/useProfile'
import Loading from '../../components/loading/Loading'
import './Landing.css'

function Landing() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('plans')
  const [notification, setNotification] = useState(null)
  
  const { plans, loading: plansLoading, error: plansError, refetch: refetchPlans } = usePlans()
  const { tickets, loading: ticketsLoading, error: ticketsError, refetch: refetchTickets, create: createTicket } = useTickets()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleBuyTicket = async (planId) => {
    try {
      setNotification({ type: 'loading', message: 'Creating ticket...' })
      await createTicket(planId)
      setNotification({ type: 'success', message: 'Ticket created successfully!' })
      refetchTickets()
      setTimeout(() => setNotification(null), 5000)
    } catch (err) {
      setNotification({ type: 'error', message: err.message })
      setTimeout(() => setNotification(null), 5000)
    }
  }

  return (
    <div className="landing-container">
      <div className="landing-hero">
        <div className="landing-header">
          <h1>Welcome to Local Church</h1>
          <p>Book your tickets for upcoming events</p>
          <button className="sign-out-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>

      <div className="landing-content">
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        <div className="tabs-container">
          <button 
            className={`tab ${activeTab === 'plans' ? 'active' : ''}`}
            onClick={() => setActiveTab('plans')}
          >
            Available Plans
          </button>
          <button 
            className={`tab ${activeTab === 'tickets' ? 'active' : ''}`}
            onClick={() => setActiveTab('tickets')}
          >
            My Tickets
          </button>
        </div>

        {activeTab === 'plans' && (
          <div className="tab-content">
            <h2>Ticket Plans</h2>
            {plansLoading && <Loading isVisible={true} message="Loading plans..." />}
            {plansError && (
              <div className="error-container">
                <p className="error-message">{plansError}</p>
                <button className="retry-btn" onClick={refetchPlans}>Try Again</button>
              </div>
            )}
            {!plansLoading && !plansError && (
              <div className="plans-grid">
                {plans.length === 0 ? (
                  <div className="empty-state">No plans available</div>
                ) : (
                  plans.map(plan => (
                    <div key={plan.id} className="plan-card">
                      <h3>{plan.name}</h3>
                      {plan.description && <p>{plan.description}</p>}
                      <div className="plan-price">
                        {plan.currency} {plan.price.toFixed(2)}
                      </div>
                      <button 
                        className="buy-btn"
                        onClick={() => handleBuyTicket(plan.id)}
                      >
                        Buy Ticket
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="tab-content">
            <h2>My Tickets</h2>
            {ticketsLoading && <Loading isVisible={true} message="Loading tickets..." />}
            {ticketsError && (
              <div className="error-container">
                <p className="error-message">{ticketsError}</p>
                <button className="retry-btn" onClick={refetchTickets}>Try Again</button>
              </div>
            )}
            {!ticketsLoading && !ticketsError && (
              <div className="tickets-list">
                {tickets.length === 0 ? (
                  <div className="empty-state">No tickets yet</div>
                ) : (
                  <div className="tickets-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Plan</th>
                          <th>Status</th>
                          <th>Booked At</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.map(ticket => (
                          <tr key={ticket.id}>
                            <td>{ticket.unique_code}</td>
                            <td>{ticket.ticket_plans?.name}</td>
                            <td>
                              <span className={`status-badge status-${ticket.status}`}>
                                {ticket.status}
                              </span>
                            </td>
                            <td>{new Date(ticket.created_at).toLocaleString()}</td>
                            <td>
                              {ticket.status === 'confirmed' && (
                                <button className="cancel-btn">Cancel</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Landing
