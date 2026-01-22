import React, { useState } from 'react';
import Navbar from './ui/Header';

const faqs = [
  {
    question: 'How to Cancel an Order Placed on Farmestore.in?',
    answer: `At Farmestore.in, we currently do not accept returns once the goods have been delivered, as per our Return and Exchange Policy. However, if you wish to cancel your order, you may do so before it is dispatched. To request a cancellation Missed Call: 9010189891 or WhatsApp us on: +91 9010189891. Cancellations are only accepted prior to dispatch, so we recommend reaching out as soon as possible.`
  },
  {
    question: 'How to Create a Return Request?',
    answer: `At Farmestore.in, our Return and Exchange Policy does not allow returns once the goods have been delivered. However, if you wish to cancel or modify your order, you may do so before dispatch. To place a request, please contact us at Toll-Free: 9010189891 or WhatsApp: +91 9010189891. Requests will only be accepted prior to dispatch, so we recommend reaching out at the earliest opportunity.`
  },
  {
    question: 'How to Check the Status of My Order?',
    answer: `Once you place an order, you will receive a message on your registered mobile number or email within 24 hours containing the tracking details. You can use this information to track your order. If you do not receive the tracking message within the given timeframe, feel free to contact us at Toll-Free: 9010189891 or WhatsApp: +91 9010189891. We’ll be happy to assist you.`
  },
  {
    question: 'Why Is There a Difference in Selling Price Between Farm E-Store and Local Shops?',
    answer: `At Farm E-Store, we focus on providing 100% genuine and high-quality agri inputs at competitive prices, delivered straight to your doorstep. While there may be differences in selling prices compared to local shops, our priority is to ensure product authenticity, quality, and convenience. We believe that the value we offer in terms of trusted brands, verified products, and doorstep delivery goes beyond just pricing.`
  },
  {
    question: 'How to Get Your Order Delivered Faster?',
    answer: `Choosing a prepaid payment method usually results in quicker delivery.`
  },
  {
    question: 'I Received a Partial Order or an Empty Package — What Should I Do?',
    answer: `If you’ve received only part of your order or an empty/void packet, for multiple-item orders, you will usually receive an SMS or IVRS (automated call) notification with details about your deliveries. If you haven’t received any updates or your order seems incomplete, please reach out to us: Call us: 9010189891 or WhatsApp us: (+91) 9010189891.`
  },
  {
    question: 'Can I Modify the Shipping Address for My Order?',
    answer: `Yes, but only within 1–2 hours of placing your order. Once the order is dispatched, it becomes difficult to change the delivery address. If the order hasn’t been dispatched yet, we’ll be happy to update the shipping address for you.`
  },
  {
    question: 'When Will I Receive My Refund for a Cancelled Order?',
    answer: `Once we receive and inspect your returned item, we’ll notify you via email about the status of your refund—whether it’s approved or rejected. If approved, your refund will be processed and credited to your original payment method (credit card, wallet, etc.) within 7 to 10 working days.`
  },
  {
    question: 'How Do I Create an Account on Farm E-Store?',
    answer: `Creating an account is quick and easy. Simply use your mobile number to sign up or log in with OTP—no passwords needed.`
  },
  {
    question: 'How Do I Log In to Farm E-Store If I No Longer Have Access to My Registered Mobile Number?',
    answer: `If you no longer have access to your previous mobile number, you’ll need to create a new account using your current mobile number.`
  },
  {
    question: 'Where Is Farm E-Store Located?',
    answer: `Our Head Office is located in Madanapalle, Andhra Pradesh.`
  },
  {
    question: 'Cash on Delivery (COD) How It Works?.',
    answer: `The Cash on Delivery (COD) payment option is available for most products, except those explicitly marked as "COD unavailable." In some cases, you may be required to pay a partial or advance amount at the time of placing the order, with the remaining balance payable in cash upon delivery.`
  },
  {
    question: 'What Is the Cash on Delivery (COD) Limit?',
    answer: `Generally there is no fixed limit for Cash on Delivery (COD) orders. However, we typically require a partial advance payment of 10–20% of the order value at the time of placing the order. The remaining amount can be paid in cash upon delivery. (Eg: Order value: ₹10,000 | 10% prepaid: ₹1,000 | COD: ₹9,000) Please note that COD may not be available for certain high-value orders or specific pin codes. In such cases, only prepaid payment methods will be accepted.`
  },
  {
    question: 'How To Apply A Coupon Code to an Order?',
    answer: `You can discover coupons on your shopping cart page. You can use coupons by copying the code or applying them while placing the order.`
  },
  {
    question: 'Can I request a replacement for my order?',
    answer: `If your order has not yet been dispatched, you can request a replacement. In case you wish to exchange an item due to a product mismatch, or if you receive a defective or expired product, we will provide a replacement free of charge. Please note that exchanges are subject to product availability in our stock. Before initiating a replacement, feel free to call us at 9010189891 or WhatsApp us at +91 9010189891 to check your order status.`
  },
  {
    question: 'How do I place an In-Store Pickup/Pick Up at Store order?',
    answer: `1. Add items to your cart\n2. At checkout, choose In-Store Pickup/Pick Up at Store option\n3. Select your preferred store location\n4. Complete payment and wait for a confirmation email or SMS`
  },
  {
    question: 'How to Collect Order After Choosing In-Store Pickup/Pick Up at Store?',
    answer: `1. Wait for Confirmation\nAfter placing your order online and selecting the “In-Store Pickup/Pick Up at Store” option, you will receive a confirmation email or message once your order is ready for pickup. Please do not go to the store before you get this notification.\n2. Bring Your Order Details\nWhen you come to the store, bring your order confirmation message or order number. This helps our staff quickly locate your order.\n3. Bring a Valid ID\nPlease bring a valid photo ID that matches the name on the order for verification purposes. If someone else is picking up your order, make sure they have your order confirmation and a signed authorization (if required).\n4. Go to the Pickup Area\nHead to the designated In-Store Pickup/Pick Up at Store area or customer service desk. Signs or store staff can guide you if you’re unsure.\n5. Check Your Order\nOur staff will verify your order and hand it over to you. Please take a moment to inspect your items before leaving the store to ensure everything is correct and in good condition.\n6. Ask Questions if Needed\nIf you have any questions about your order, product care, or next steps, feel free to ask the staff at pickup.`
  }
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '24px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '32px' }} className="text-xl md:text-2xl font-bold mb-4">Frequently Asked Questions</h1>        
        <div>
          {faqs.map((faq, idx) => (
            <div key={idx} style={{
              marginBottom: '16px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              overflow: 'hidden',
              background: '#fff'
            }}>
              <div
                onClick={() => handleToggle(idx)}
                style={{
                  cursor: 'pointer',
                  padding: '18px 24px',
                  background: 'linear-gradient(to bottom, #f7f8fa 0%, #fff 100%)',
                  color: '#2e7d32',
                  fontWeight: 600,
                  fontSize: '1.08rem',
                  borderBottom: openIndex === idx ? '1px solid #e0e0e0' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{faq.question}</span>
                <span>
                  {openIndex === idx ? (
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#388e3c" style={{ width: 24, height: 24, transform: 'rotate(180deg)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  ) : (
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#388e3c" style={{ width: 24, height: 24, transform: 'rotate(0deg)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  )}
                </span>
              </div>
              {openIndex === idx && (
                <div style={{ padding: '18px 24px', background: '#fff', color: '#333', fontSize: '1.02rem', whiteSpace: 'pre-line' }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Faq;
