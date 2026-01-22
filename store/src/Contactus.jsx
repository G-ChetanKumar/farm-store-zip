import React from 'react';
import Navbar from './ui/Header';

const Contactus = () => (
  <>
    <Navbar />
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '24px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h1 style={{ color: '#2e7d32', marginBottom: '20px' }}>Contact Us</h1>
      <h2 style={{ color: '#388e3c', marginBottom: '16px' }}>Registered Office :</h2>
      <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#333', marginBottom: '8px' }}>
        <b>Farm E-Store Private Limited</b><br />
        #6/237-G-8-K Devalam Street Extn. Ward No-6, Madanapalle – 517325<br />
        Annamayya District, Andhra Pradesh
      </p>
      <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: '8px' }}>
        <b>Phone :</b> <a href="tel:+919010189891" style={{ color: '#2e7d32', textDecoration: 'underline' }}>+91-9010189891</a>
      </p>
      <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: '8px' }}>
        <b>Email :</b> <a href="mailto:info@farmestore.in" style={{ color: '#2e7d32', textDecoration: 'underline' }}>info@farmestore.in</a>
      </p>
      <p style={{ fontSize: '1.1rem', color: '#333' }}>
        <b>Working Hours :</b> Monday to Saturday, 10:00 AM – 6:00 PM
      </p>
    </div>
  </>
);

export default Contactus;
