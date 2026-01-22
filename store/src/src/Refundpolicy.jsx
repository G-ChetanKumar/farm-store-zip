import React from 'react';
import Navbar from './ui/Header';

const sectionStyle = { fontSize: '1.08rem', lineHeight: '1.7', color: '#333', marginBottom: '18px' };
const headingStyle = { color: '#2e7d32', marginTop: '12px', marginBottom: '12px', fontSize: '1.2rem' };
const listStyle = { marginTop: '8px', marginBottom: '8px', paddingLeft: '20px' };

const Refundpolicy = () => (
  <>
    <Navbar />
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '32px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflowY: 'auto' }}>
      <h1 style={headingStyle}>Return &amp; Exchange Policy</h1>
      <div style={sectionStyle}>
        At Farmestore.in, we do not accept returns once goods are delivered. However, if you receive a wrong, defective, or expired item, we offer a free replacement, subject to product availability in our stock.
      </div>
      <h2 style={headingStyle}>Conditions for Exchange</h2>
      <div style={sectionStyle}>
        Exchanges are allowed only for:
        <ul style={listStyle}>
          <li>Wrong product received</li>
          <li>Defective or damaged item</li>
          <li>Expired product</li>
        </ul>
        <ul style={listStyle}>
          <li>Exchange requests are subject to availability of the replacement item in our inventory.</li>
          <li>Your address must be serviceable by our logistics partners to qualify for an exchange.</li>
        </ul>
      </div>
      <h2 style={headingStyle}>Exceptions &amp; Guidelines</h2>
      <div style={sectionStyle}>
        The following conditions must be met for a product to be eligible for exchange:
        <ul style={listStyle}>
          <li>Items must be unused, in original condition, and have all labels, packaging, and tags intact.</li>
          <li>Products must not be tampered with, broken, or opened (especially in the case of sealed or perishable items).</li>
          <li>Exchange requests must be raised within 2 days of delivery.</li>
          <li>Perishable goods, such as seeds or flowers, are non-returnable if the packet is opened or damaged.</li>
          <li>Any item with a free gift or promotional offer must be returned with all associated free items. Refunds or exchanges may be adjusted based on the return status of such promotional items.</li>
          <li>Customers opting to self-ship must ensure secure packaging to prevent damage in transit. We recommend using a reliable courier service.</li>
          <li>Products must be returned within 7 days from the date of delivery.</li>
          <li>An unboxing video is required to support any complaint. Please share it on WhatsApp at <a href="https://wa.me/919010189891" style={{ color: '#2e7d32', textDecoration: 'underline' }}>+91-9010189891</a>.</li>
          <li>Proof of purchase or receipt is mandatory for all return/exchange claims.</li>
        </ul>
        To initiate a return or exchange, contact our Customer Support at <a href="tel:+919010189891" style={{ color: '#2e7d32', textDecoration: 'underline' }}>+91-9010189891</a>.
      </div>
      <h2 style={headingStyle}>Refund Policy (If Applicable)</h2>
      <div style={sectionStyle}>
        Once we receive and inspect your returned item, you will be notified of the approval or rejection of your refund.
        <ul style={listStyle}>
          <li>If approved, your refund will be processed within 7–10 working days, and credited to your original payment method.</li>
        </ul>
      </div>
      <h2 style={headingStyle}>Note on Refund Delays:</h2>
      <div style={sectionStyle}>
        If you haven’t received your refund:
        <ul style={listStyle}>
          <li>Recheck your bank account.</li>
          <li>Contact your credit card company (processing may take time).</li>
          <li>Contact your bank (some delays are due to bank processing).</li>
          <li>If issues persist, email us at <a href="mailto:info@farmestore.in" style={{ color: '#2e7d32', textDecoration: 'underline' }}>info@farmestore.in</a>.</li>
        </ul>
      </div>
      <h2 style={headingStyle}>Order Cancellation by Farm E-Store</h2>
      <div style={sectionStyle}>
        We reserve the right to cancel any order, fully or partially, in the event of:
        <ul style={listStyle}>
          <li>Product unavailability</li>
          <li>Force majeure or unforeseen circumstances</li>
          <li>Suspected fraud</li>
          <li>Breach of our Terms of Use</li>
          <li>Logistical limitations</li>
        </ul>
        In such cases, any prepaid amount will be refunded in accordance with this policy.
      </div>
      <h2 style={headingStyle}>Shipping Details for Returns</h2>
      <div style={sectionStyle}>
        If you are returning a product, please ship it to the following address:<br />
        <b>Farm E-Store Private Limited</b><br />
        6/237-G-8-K, Devalam Street Extension,<br />
        Ward No. 6, Madanapalle – 517325,<br />
        Annamayya District, Andhra Pradesh, India<br />
        <ul style={listStyle}>
          <li>Customers are responsible for return shipping costs, unless the return is due to our error.</li>
          <li>Shipping charges are non-refundable. If you receive a refund, the cost of return shipping will be deducted.</li>
        </ul>
        Delivery times for exchanged products may vary based on your location.
      </div>
      <h2 style={headingStyle}>Governing Law</h2>
      <div style={sectionStyle}>
        All policies are governed by the laws of India. Any disputes shall fall under the exclusive jurisdiction of the courts located in Madanapalle, Andhra Pradesh.
      </div>
    </div>
  </>
);

export default Refundpolicy;
