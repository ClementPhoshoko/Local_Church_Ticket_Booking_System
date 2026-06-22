import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Unauthenticated.css'
import heroImage from '../../assets/Family_picnic_by_the_lakeside.png'

function Unauthenticated() {
  const navigate = useNavigate()

  return (
    <div className="unauthenticated-layout">
      <div className="unauthenticated-layout__hero">
        <img src={heroImage} alt="Family picnic" className="unauthenticated-layout__hero-image" />
      </div>
      <div className="unauthenticated-layout__verse">
        <p>Come to Me, all you who labor and are heavy laden,</p>
        <p>and I will give you rest.</p>
        <p>Take My yoke upon you and learn from Me,</p>
        <p>for I am gentle and lowly in heart,</p>
        <p>and you will find rest for your souls.</p>
        <p className="unauthenticated-layout__verse-reference">Matthew 11:28-29</p>
      </div>
      <div className="unauthenticated-layout__content">
        <div className="unauthenticated-card">
          <div className="unauthenticated-card__header">
            <div className="unauthenticated-card__avatar">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="32" fill="var(--color-glass-bg-light)"/>
                <circle cx="32" cy="26" r="10" fill="var(--color-white-soft)"/>
                <path d="M16 52C16 43.2 23.2 36 32 36C40.8 36 48 43.2 48 52" stroke="var(--color-white-soft)" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="unauthenticated-card__title">Access Restricted</h1>
            <p className="unauthenticated-card__subtitle">
              To continue, please log in to your account or create a new one.
            </p>
          </div>
          <button 
            className="unauthenticated-card__button"
            onClick={() => navigate('/')}
          >
            Return to Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default Unauthenticated
