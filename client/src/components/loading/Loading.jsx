import React from 'react'
import './Loading.css'
import HeroImage from '../../assets/Community_gathering_outside_the_church.png'

function Loading({ message = 'Loading...', isVisible = false }) {
  if (!isVisible) return null

  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-hero">
          <img src={HeroImage} alt="Community Gathering" className="loading-hero-image" />
          <div className="loading-header">
            <h1>Loading...</h1>
          </div>
        </div>
        
        <div className="loading-content-card">
          <div className="loading-spinner"></div>
          <p className="loading-message">{message}</p>
        </div>
      </div>
    </div>
  )
}

export default Loading
