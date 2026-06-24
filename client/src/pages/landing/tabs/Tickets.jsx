import React from 'react'
import Loading from '../../../components/loading/Loading'
import './Tickets.css'

function Tickets({ tickets, ticketsLoading, ticketsError, refetchTickets, handleViewTicketDetails, handleCancelTicket, processingCancel }) {
  return (
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
                              onClick={() => handleViewTicketDetails(ticket)}
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
  )
}

export default Tickets
