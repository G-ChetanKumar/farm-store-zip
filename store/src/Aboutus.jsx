import React from 'react';
import Navbar from './ui/Header';

const Aboutus = () => (
    
        <>
        <Navbar/>
  <div style={{ maxWidth: '800px', margin: '40px auto', padding: '24px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
    <h1 style={{ color: '#2e7d32', marginBottom: '20px' }} className="text-2xl md:text-3xl font-bold mb-4">About Us</h1>
    <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#333' }}>
      <b>Farm E-Store</b> is a dynamic agriculture startup company dedicated to empowering farmers and agri-entrepreneurs across the nation. Led by Directors <b>Mr. Lankipalli Kamal Chowdary</b> and <b>Mr. Lankipalli Rajagopal Naidu,</b> the company is committed to supply trusted, high-quality premium seeds, fertilizers, agrochemicals, and a diverse range of allied agricultural inputs essential for modern, efficient, and sustainable farming.
    </p>
    <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#333' }}>
      With a presence both online and offline, Farm E-Store effectively bridges the gap between farmers and dependable agricultural solutions. Our user-friendly digital platform ensures convenience and broad accessibility, while our physical stores deliver personalized service and expert support—equipping farmers with the tools and knowledge to optimize productivity and sustainability.
    </p>
    <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#333' }}>
      Backed by deep industry expertise and a visionary leadership team, Farm E-Store is dedicated to becoming a trusted partner within the agricultural community, driving growth, innovation, and lasting impact throughout the sector.
    </p>
  </div>
  </>
  
);

export default Aboutus;
