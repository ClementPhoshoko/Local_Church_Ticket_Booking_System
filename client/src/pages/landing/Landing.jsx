import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'
import { usePlans, useTickets, usePayments } from '../../hooks'
import { useProfile } from '../../hooks/useProfile'
import Loading from '../../components/loading/Loading'
import './Landing.css'

function Landing() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('plans')
  const [notification, setNotification] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showTicketDetails, setShowTicketDetails] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [processingCancel, setProcessingCancel] = useState(false)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const { plans, loading: plansLoading, error: plansError, refetch: refetchPlans } = usePlans()
  const { tickets, loading: ticketsLoading, error: ticketsError, refetch: refetchTickets, create: createTicket, cancel: cancelTicket } = useTickets()
  const { transactions, loading: paymentsLoading, refetch: refetchPayments, initiate: initiatePayment } = usePayments(selectedTicket?.id)

  const notify = (type, message, duration = 5000) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), duration)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleBuyTicket = async (planId) => {
    try {
      notify('loading', 'Creating ticket...')
      const result = await createTicket(planId)
      notify('success', 'Ticket created successfully!')
      refetchTickets()
      setActiveTab('tickets')
      setSelectedTicket(result.ticket)
      setShowTicketDetails(true)
    } catch (err) {
      notify('error', err.message)
    }
  }

  const handleInitiatePayment = async () => {
    if (!selectedTicket) return
    try {
      setProcessingPayment(true)
      notify('loading', 'Processing payment...')
      const result = await initiatePayment(selectedTicket.id, 'mock')
      if (result.gateway_redirect_url) {
        await fetch(result.gateway_redirect_url, { method: 'GET' })
      }
      notify('success', 'Payment completed successfully!')
      refetchTickets()
      refetchPayments()
    } catch (err) {
      notify('error', err.message)
    } finally {
      setProcessingPayment(false)
    }
  }

  const handleCancelTicket = async (ticketId) => {
    try {
      setProcessingCancel(ticketId)
      notify('loading', 'Cancelling ticket...')
      await cancelTicket(ticketId)
      notify('success', 'Ticket cancelled successfully!')
      refetchTickets()
      if (selectedTicket?.id === ticketId) {
        setShowTicketDetails(false)
        setSelectedTicket(null)
      }
    } catch (err) {
      notify('error', err.message)
    } finally {
      setProcessingCancel(false)
    }
  }

  const handleViewTicketDetails = (ticket) => {
    setSelectedTicket(ticket)
    setShowTicketDetails(true)
  }

  const handleCloseDetails = () => {
    setShowTicketDetails(false)
    setSelectedTicket(null)
  }

  return (
    <div className="landing-container">

      {/* ── Hero ── */}
      <div className="landing-hero">
        <div className="landing-header">
          <div className="landing-header-text">
            <h1>Welcome to Local Church</h1>
            <p>Book your tickets for upcoming events</p>
          </div>
          <div className="landing-header-buttons">
            <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? (
                // Moon icon (dark mode)
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              ) : (
                // Sun icon (light mode)
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              )}
            </button>
            <button className="sign-out-btn" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* ── Main content (overlaps hero bottom edge) ── */}
      <div className="landing-content">

        {/* Notification banner */}
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        {/* Tab switcher */}
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

        {/* ── Plans tab ── */}
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
                  <div className="empty-state">No plans available at the moment.</div>
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

        {/* ── Tickets tab ── */}
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
                  <div className="empty-state">
                    You have no tickets yet. Browse the Available Plans to get started.
                  </div>
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
                            <td>
                              <button
                                className="code-btn"
                                onClick={() => handleViewTicketDetails(ticket)}
                              >
                                {ticket.unique_code}
                              </button>
                            </td>
                            <td>{ticket.ticket_plans?.name}</td>
                            <td>
                              <span className={`status-badge status-${ticket.status}`}>
                                {ticket.status}
                              </span>
                            </td>
                            <td>{new Date(ticket.created_at).toLocaleString()}</td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  className="view-btn"
                                  onClick={() => handleViewTicketDetails(ticket)}
                                >
                                  View
                                </button>
                                {ticket.status === 'pending' && (
                                  <button
                                    className="pay-btn"
                                    onClick={() => {
                                      setSelectedTicket(ticket)
                                      setShowTicketDetails(true)
                                    }}
                                  >
                                    Pay
                                  </button>
                                )}
                                {ticket.status === 'confirmed' && (
                                  <button
                                    className="cancel-btn"
                                    onClick={() => handleCancelTicket(ticket.id)}
                                    disabled={processingCancel === ticket.id}
                                  >
                                    {processingCancel === ticket.id ? 'Cancelling…' : 'Cancel'}
                                  </button>
                                )}
                              </div>
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

      {/* ── Ticket detail modal ── */}
      {showTicketDetails && selectedTicket && (
        <div className="modal-overlay" onClick={handleCloseDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>

            <div className="modal-header">
              <h2>Ticket Details</h2>
              <button className="close-btn" onClick={handleCloseDetails} aria-label="Close">×</button>
            </div>

            <div className="modal-body">

              {/* Info rows */}
              <div className="ticket-info">
                <div className="info-row">
                  <span className="label">Unique Code</span>
                  <span className="value code-value">{selectedTicket.unique_code}</span>
                </div>
                <div className="info-row">
                  <span className="label">Plan</span>
                  <span className="value">{selectedTicket.ticket_plans?.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Description</span>
                  <span className="value">{selectedTicket.ticket_plans?.description || 'No description'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Price</span>
                  <span className="value">
                    {selectedTicket.ticket_plans?.currency} {selectedTicket.ticket_plans?.price.toFixed(2)}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Status</span>
                  <span className={`value status-badge status-${selectedTicket.status}`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Booked At</span>
                  <span className="value">{new Date(selectedTicket.created_at).toLocaleString()}</span>
                </div>
                {selectedTicket.confirmed_at && (
                  <div className="info-row">
                    <span className="label">Confirmed At</span>
                    <span className="value">{new Date(selectedTicket.confirmed_at).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Payment section */}
              {selectedTicket.status === 'pending' && (
                <div className="payment-section">
                  <h3>Complete Payment</h3>
                  <p>Click below to complete your payment using our mock payment gateway.</p>
                  <button
                    className="pay-now-btn"
                    onClick={handleInitiatePayment}
                    disabled={processingPayment}
                  >
                    {processingPayment ? 'Processing…' : 'Pay Now'}
                  </button>
                </div>
              )}

              {/* Payment history */}
              {transactions.length > 0 && (
                <div className="transactions-section">
                  <h3>Payment History</h3>
                  <div className="transactions-list">
                    {transactions.map(tx => (
                      <div key={tx.id} className="transaction-item">
                        <div className="tx-info">
                          <span className="tx-gateway">{tx.gateway}</span>
                          <span className={`tx-status status-badge status-${tx.status}`}>{tx.status}</span>
                        </div>
                        <div className="tx-amount">
                          {tx.currency} {tx.amount.toFixed(2)}
                        </div>
                        <div className="tx-date">
                          {new Date(tx.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {selectedTicket.status === 'confirmed' && (
                <button
                  className="cancel-ticket-btn"
                  onClick={() => handleCancelTicket(selectedTicket.id)}
                  disabled={processingCancel === selectedTicket.id}
                >
                  {processingCancel === selectedTicket.id ? 'Cancelling…' : 'Cancel Ticket'}
                </button>
              )}
              <button className="close-modal-btn" onClick={handleCloseDetails}>Close</button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default Landing
