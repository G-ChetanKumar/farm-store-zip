import React from 'react';
import Navbar from './ui/Header';

const sectionStyle = { fontSize: '1.08rem', lineHeight: '1.7', color: '#333', marginBottom: '18px' };
const headingStyle = { color: '#2e7d32', marginTop: '12px', marginBottom: '12px', fontSize: '1.2rem' };
const listStyle = { marginTop: '8px', marginBottom: '8px', paddingLeft: '20px' };

const Shippingpolicy = () => (
  <>
    <Navbar />
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '32px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflowY: 'auto' }}>
      <h1 style={headingStyle}>Delivery Policy</h1>
      <div style={sectionStyle}>
        <b>Estimated Delivery Timeline:</b><br />
        Your order is expected to be delivered within 5–7 working days.<br />
        We aim to provide a smooth and timely delivery experience across India. Orders are typically dispatched within 2–3 business days via our trusted and registered courier partners.
      </div>
      <h2 style={headingStyle}>Shipping Charges:</h2>
      <div style={sectionStyle}>
        <ul style={listStyle}>
          <li>Free or paid shipping options are available based on the order value, location, and ongoing offers.</li>
          <li>Shipping charges (if any) will be clearly displayed at checkout before you make the payment.</li>
        </ul>
      </div>
      <h2 style={headingStyle}>Delivery Timeframes:</h2>
      <div style={sectionStyle}>
        <ul style={listStyle}>
          <li>Delivery timelines are indicative and may vary slightly based on your location, order volume, or courier availability.</li>
          <li>In the case of multiple items, your order may be shipped in parts and may take additional time to reach you.</li>
        </ul>
      </div>
      <h2 style={headingStyle}>Unforeseen Delays:</h2>
      <div style={sectionStyle}>
        Occasionally, delivery may be delayed due to factors beyond our control, such as:
        <ul style={listStyle}>
          <li>Natural calamities</li>
          <li>Weather disruptions</li>
          <li>Public holidays</li>
          <li>Transport strikes</li>
          <li>Force majeure events</li>
          <li>Delays from third-party courier partners or component suppliers</li>
        </ul>
        In such cases, the estimated delivery period will be extended reasonably, and we will keep you informed regarding the status of your shipment.
      </div>
      <div style={sectionStyle}>
        For any delivery-related queries, feel free to reach out to our customer support team at <a href="tel:+919010189891" style={{ color: '#2e7d32', textDecoration: 'underline' }}>+91-9010189891</a> or email us at <a href="mailto:info@farmestore.in" style={{ color: '#2e7d32', textDecoration: 'underline' }}>info@farmestore.in</a>.
      </div>
    </div>
  </>
);

export default Shippingpolicy;
