import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'
import { usePlans, useTickets, usePayments } from '../../hooks'
import { useProfile } from '../../hooks/useProfile'
import Loading from '../../components/loading/Loading'
import HeroImage from '../../assets/Community_gathering_outside_the_church.png'
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
      {/* Hero Section */}
      <div className="landing-hero">
        <img src={HeroImage} alt="Community Gathering" className="landing-hero-image" />
        <div className="landing-header">
          <h1>Welcome to Local Church</h1>
          <button className="sign-out-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Notification banner */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="landing-tabs">
        <button 
          className={`landing-tab ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          Available Plans
        </button>
        <button 
          className={`landing-tab ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          My Tickets
        </button>
      </div>

      <div className="landing-content">
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
