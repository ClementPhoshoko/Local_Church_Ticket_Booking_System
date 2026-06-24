import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'
import { usePlans, useTickets, usePayments } from '../../hooks'
import { useProfile } from '../../hooks/useProfile'
import Loading from '../../components/loading/Loading'
import AvailablePlans from './tabs/AvailablePlans'
import Tickets from './tabs/Tickets'
import Payment from '../../payment/Payment'
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

        {/* Tab switcher inside a box */}
        <div className="tabs-box">
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
        </div>

        {/* ── Plans tab ── */}
        {activeTab === 'plans' && (
          <AvailablePlans
            plans={plans}
            plansLoading={plansLoading}
            plansError={plansError}
            refetchPlans={refetchPlans}
            handleBuyTicket={handleBuyTicket}
          />
        )}

        {/* ── Tickets tab ── */}
        {activeTab === 'tickets' && (
          <Tickets
            tickets={tickets}
            ticketsLoading={ticketsLoading}
            ticketsError={ticketsError}
            refetchTickets={refetchTickets}
            handleViewTicketDetails={handleViewTicketDetails}
            handleCancelTicket={handleCancelTicket}
            processingCancel={processingCancel}
          />
        )}
      </div>

      {/* ── Ticket detail modal ── */}
      {showTicketDetails && selectedTicket && (
        <Payment
          selectedTicket={selectedTicket}
          transactions={transactions}
          paymentsLoading={paymentsLoading}
          processingPayment={processingPayment}
          processingCancel={processingCancel}
          handleCloseDetails={handleCloseDetails}
          handleInitiatePayment={handleInitiatePayment}
          handleCancelTicket={handleCancelTicket}
        />
      )}
    </div>
  )
}

export default Landing
