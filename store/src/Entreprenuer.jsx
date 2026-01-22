import React from "react";
import Navbar from "./ui/Header";

const EntrepreneurForm = () => {
  // Form state
  const [form, setForm] = React.useState({
    name: '',
    gender: '',
    phone: '',
    email: '',
    user_type: 'Agent',  // Default to Agent
    state: '',
    district: '',
    mandal: '',
    cityTownVillage: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(null);
  const [error, setError] = React.useState(null);

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const response = await fetch('https://farme-store-backend.vercel.app/api/entrepreneur/add-entrepreneur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (data.success) {
        setSuccess('Application submitted successfully! Our team will review your application and contact you within 2-3 business days. Please check your phone and email for updates.');
        setForm({
          name: '', gender: '', phone: '', email: '', user_type: 'Agent', state: '', district: '', mandal: '', cityTownVillage: ''
        });
      } else {
        setError(data.error || 'Submission failed.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
    
 const entrepreneurFaqs = [
    
    {
      question: 'How the Company Selects Entrepreneur/Agents?',
      answer: `The company identifies and selects motivated men and women entrepreneurs from each village to serve as local Product Booking and Delivery Agents. These individuals act as the company's representatives within their respective communities, managing customer orders and ensuring timely product delivery at the village level.`
    },
    {
      question: 'What is the Role of an Entrepreneur/Agent?',
      answer: `The Entrepreneur/Agent primarily invests money to purchase agricultural inputs and serves as the last-mile delivery partner for these products. They also assist customers in placing orders when needed, acting as a crucial link between the Farm E-Store and the farmers.`
    },
    {
      question: 'What is the Work of an Entrepreneur/Agent?',
      answer: `Farm E-Store agents visit farmers’ fields to provide advice, collect data, and deliver agricultural inputs. These agents are usually local residents with agricultural knowledge who can communicate effectively with farmers. They also identify potential farmers and onboard them onto the platform by gathering essential information such as landholding size, crop history, and other relevant data.`
    },
    {
      question: 'How to Become a Farm E-Store Agent Online?',
      answer: `Simply fill out the "Become Entrepreneur" form available on our website to get started.`
    },
    {
      question: 'How do I place an order for a customer?',
      answer: `You can place orders:\n• Through the Farm E-Store agent portal.\n• Using the website/mobile app.\n• Or by contacting your assigned sales coordinator for offline/manual orders at +91 9010189891.`
    },
    {
      question: 'Do I need to keep stock/inventory?',
      answer: `No. Farm E-Store typically follows a direct fulfillment model, so you don’t need to maintain inventory. Products are delivered directly to the customer or to your location for pickup.`
    },
    {
      question: 'Where do I get the product and pricing details?',
      answer: `Once you register, you will receive access to official Farm E-Store prices and commission percentages, which can be viewed through the Agent Dashboard on the website or app.`
    },
    {
      question: 'What is the payout frequency daily or weekly?',
      answer: `Payments are settled on a weekly basis.`
    },
    {
      question: 'Who all can become an Farm E-Store Agent?',
      answer: `Farm E-Store Agent opportunities are open to a wide range of individuals, including:\n• Entrepreneurs\n• Homemakers\n• College Students\n• Job Seekers\n• Salaried Individuals\n• Self-Employed Individuals\n• Retired Persons\n• Anyone Seeking Additional Income`
    },
    {
      question: 'Is there any joining fee or security deposit for becoming an entrepreneur/agent with Farm E-Store?',
      answer: `No, there are no joining fees or deposits required to become an entrepreneur or agent with Farm E-Store.`
    },
    {
      question: 'What is the salary of an Entrepreneur/Agent?',
      answer: `The income of an Entrepreneur/Agent depends on factors like sales performance, location, and effort invested. There is no fixed salary, but agents earn through commissions on product sales, bonuses, and other incentives. With dedication, it is possible to build a stable and rewarding income, often with uncapped earning potential.`
    },
    {
      question: 'How much is the commission for Entrepreneur/Agent?',
      answer: `The commission percentage varies depending on the product. Each product comes with a different commission percentage. Detailed commission structures will be shared with you after registration.`
    },
    {
      question: 'Does Farm E-Store deduct any taxes?',
      answer: `Yes. when you receive commission payments from the Farm E‑Store via the Agent Dashboard, 2% TDS (Tax Deducted at Source) will be automatically withheld.\nThis deduction is applied at source on each transaction and your dashboard payout will reflect the net amount after the 2% TDS. You'll also receive a TDS certificate (Form 16A) for filing your taxes.`
    },
    {
      question: 'Why do Entrepreneurs|Agents pay 2% TDS?',
      answer: `Agents pay 2% TDS (Tax Deducted at Source) on their commission income because it’s a legal requirement by the government to collect tax upfront on certain types of payments, including commissions. This helps the government track income and ensures tax is paid regularly, rather than waiting until the end of the financial year.\nIn simple terms:\n• When Farm E-Store pays commission to agents, they deduct 2% of the amount as tax before making the payment.\n• This 2% is deposited directly with the government on the agent’s behalf.\n• Agents can claim this deducted amount as a tax credit when filing their income tax returns.`
    },
    {
      question: 'What’s the minimum business Target for  Entrepreneur/Agent?',
      answer: `There are no limits or targets the more you do, the more you earn.`
    },
    {
      question: 'Does the Company provide customers or do Entrepreneur/Agent have to find customers themselves?',
      answer: `• Market the company’s products/services on your own.\n• Find and approach potential customers usually through:\n  ◦ Word of mouth\n  ◦ Door-to-door outreach\n  ◦ Community events\n  ◦ Social media or WhatsApp\n• Build trust in your local area to create a client base.`
    },
    {
      question: 'Why should you become an Entrepreneur/Agent of Farm E-Store Private Limited?',
      answer: `• Stable Income\n• Uncapped commissions\n• Secondary source of income\n• Bonuses\n• Non-Cash perks and benefits\n• Upskilling\n• Work from anywhere\n• Flexible work timings\n• Zero Investment\n• Be your own boss`
    },
    {
      question: 'Is English speaking mandatory for this?',
      answer: `Not at all. There is no mandatory language requirement. While the preferred language is usually the local language of your area, we provide all information and support in the language you are most comfortable with.`
    },
    {
      question: 'When Will I Receive a Call from the Team?',
      answer: `Our working hours are Monday to Saturday, 9:00 AM to 8:00 PM. You can expect a call from our team during these hours.`
    },
    {
      question: 'How do I know if I’m eligible for the role?',
      answer: `Once you submit your details, our representative will contact you to assist in verifying your eligibility.`
    },
    {
      question: 'Can I become an Farm E-Store agent in any location of my choice?',
      answer: `Yes, you can sell products from any location of your choice and relocate freely without any hassle.`
    }
  ];
  const [openIndex, setOpenIndex] = React.useState(null);
  const handleToggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center py-4 px-4">
        <div className="w-full max-w-md">
          <h2 className="text-xl font-bold text-center border-b-2 pb-2 mb-4">Become Entrepreneur/Agent</h2>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="border-2 border-green-500 rounded-md p-2">
              <input
                type="text"
                name="name"
                placeholder="Name"
                className="w-full outline-none text-gray-500"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="border-2 border-green-500 rounded p-2">
              <input
                type="text"
                name="gender"
                placeholder="Male/Female"
                className="w-full outline-none text-gray-500"
                value={form.gender}
                onChange={handleChange}
                required
              />
            </div>
            <div className="border-2 border-green-500 rounded p-2">
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                className="w-full outline-none text-gray-500"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="border-2 border-green-500 rounded p-2">
              <input
                type="email"
                name="email"
                placeholder="E-mail"
                className="w-full outline-none text-gray-500"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="border-2 border-green-500 rounded p-2">
              <select
                name="user_type"
                className="w-full outline-none text-gray-500 py-1"
                value={form.user_type}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Role --</option>
                <option value="Agent">Agent - Commission-based sales</option>
                <option value="Agri-Retailer">Agri-Retailer - Bulk purchasing</option>
              </select>
            </div>
            
            <div className="border-2 border-green-500 rounded p-2">
              <input
                type="text"
                name="state"
                placeholder="State"
                className="w-full outline-none text-gray-500"
                value={form.state}
                onChange={handleChange}
                required
              />
            </div>
            <div className="border-2 border-green-500 rounded p-2">
              <input
                type="text"
                name="district"
                placeholder="District"
                className="w-full outline-none text-gray-500"
                value={form.district}
                onChange={handleChange}
                required
              />
            </div>
            <div className="border-2 border-green-500 rounded p-2">
              <input
                type="text"
                name="mandal"
                placeholder="Mandal"
                className="w-full outline-none text-gray-500"
                value={form.mandal}
                onChange={handleChange}
                required
              />
            </div>
            <div className="border-2 border-green-500 rounded p-2">
              <input
                type="text"
                name="cityTownVillage"
                placeholder="City/Town/Village"
                className="w-full outline-none text-gray-500"
                value={form.cityTownVillage}
                onChange={handleChange}
                required
              />
            </div>
            <center>
              <button
                type="submit"
                className="w-40 bg-green-500 justify-between text-white font-bold py-2 px-4 rounded text-lg mt-2"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </center>
            {success && <p className="text-green-600 text-center mt-2">{success}</p>}
            {error && <p className="text-red-600 text-center mt-2">{error}</p>}
          </form>
          <p className="text-center mt-3 text-sm">
            You may also call us at <span className="text-orange-500 font-bold">9010189891</span>
          </p>
        </div>
      </div>
      {/* FAQ Section outside the form container for full width */}
      <div className="mt-8 mx-auto" style={{ maxWidth: '900px' }}>
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">Entrepreneur/Agent FAQs</h2>
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">Register For Become An Entrepreneur/Agent And Become Financially Self Sufficient.</h2>
        <div>
          {entrepreneurFaqs.map((faq, idx) => (
            <div
              key={idx}
              className="mb-4 rounded-lg border border-gray-200 overflow-hidden bg-white"
            >
              <div
                onClick={() => handleToggle(idx)}
                className="cursor-pointer px-6 py-4 flex items-center justify-between"
                style={{
                  background: 'linear-gradient(to bottom, #f7f8fa 0%, #fff 100%)',
                  color: '#2e7d32',
                  fontWeight: 600,
                  fontSize: '1.08rem',
                  borderBottom: openIndex === idx ? '1px solid #e0e0e0' : 'none',
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
                <div className="px-6 py-4 bg-white text-gray-700 text-base whitespace-pre-line">
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

export default EntrepreneurForm;
