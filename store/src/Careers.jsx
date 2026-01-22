import React from 'react';
import Navbar from './ui/Header';

const Careers = () => (
  <>
    <Navbar />
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '24px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h1 style={{ color: '#2e7d32', marginBottom: '20px' }}>Work With Us</h1>
      <h2 style={{ color: '#388e3c', marginBottom: '16px' }}>Let’s grow together!</h2>
      <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#333' }}>
        Are you ready to make a difference in agri-tech? At <b>Farm E-Store</b>, we’re always looking for passionate individuals to join our team. We believe in creating impactful experiences not only for our customers but also for our employees.
      </p>
      <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#333' }}>
        If you're excited to be part of a dynamic and purpose-driven environment, we’d love to hear from you!<br />
        <b>Send your updated CV to :</b> <a href="mailto:careers@farmestore.in" style={{ color: '#2e7d32', textDecoration: 'underline' }}>careers@farmestore.in</a>
      </p>
      <a
        href="https://drive.google.com/file/d/1ZmDH8TZkn-8ebUfy-OhawZQ2MlSy88tn/view?usp=sharing"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          marginTop: '32px',
          color: '#1b5e20',
          textDecoration: 'underline',
        }}
      >
        Job Offer – Do’s &amp; Don’ts
      </a>
      
    </div>
  </>
);

export default Careers;
