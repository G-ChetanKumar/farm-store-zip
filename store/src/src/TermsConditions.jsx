import React from 'react';
import Navbar from './ui/Header';

const sectionStyle = { fontSize: '1.08rem', lineHeight: '1.7', color: '#333', marginBottom: '18px' };
const headingStyle = { color: '#2e7d32', marginTop: '12px', marginBottom: '12px', fontSize: '1.2rem' };
const listStyle = { marginTop: '8px', marginBottom: '8px', paddingLeft: '20px' };

const TermsConditions = () => (
  <>
    <Navbar />
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '32px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflowY: 'auto' }}>
      <center><h1 style={headingStyle}>Terms &amp; Conditions</h1></center>
      <div style={sectionStyle}>
        <b>Introduction :</b><br />
        Farm E-Store ("Website") is an internet-based platform that provides agricultural content and e-commerce services, operated by a company incorporated under the laws of India. Farm E-Store operates through both online and offline channels to serve its users.<br />
        By using this Website, you agree to comply with all the terms, conditions, and notices outlined in these Terms of Use, which may be updated by Farm E-Store from time to time. Farm E-Store reserves the right, at its sole discretion, to deny registration or access to the Website to any user, without providing a reason.
      </div>
      <h2 style={headingStyle}>User Account, Password, and Security :</h2>
      <div style={sectionStyle}>
        Upon completing the registration process on the Website, you will be assigned an account and a password. You are solely responsible for maintaining the confidentiality of your account details and password and for all activities that occur under your account.<br />
        You agree to:<br />
        (a) promptly notify Farm E-Store of any unauthorized use of your account or password, or any other security breach; and<br />
        (b) ensure that you log out of your account at the end of each session.<br />
        Farm E-Store shall not be liable for any loss or damage arising from your failure to comply with this section.
      </div>
      <h2 style={headingStyle}>Services Offered :</h2>
      <div style={sectionStyle}>
        Farmestore.in provides a wide range of agricultural products, tools, and expert services tailored to meet the needs of farmers at every stage of crop cultivation, protection, and yield enhancement. Our offerings include:
        <ol style={listStyle}>
          <li><b>Membership &amp; Advisory Services</b>
            <ul>
              <li>Membership Subscriptions: Unlock exclusive benefits including special discounts, loyalty rewards, and early access to new products.</li>
              <li>Extension Services: Get expert agronomy support, crop-specific advisory, and personalized farming guidance from our in-house experts.</li>
            </ul>
          </li>
          <li><b>Crop Protection Products</b><br />Protect your crops effectively with our wide selection of pest and disease control solutions:
            <ul>
              <li>Insecticides</li>
              <li>Fungicides</li>
              <li>Herbicides</li>
              <li>Bactericides</li>
              <li>Rodenticides</li>
              <li>Ant Control</li>
              <li>Cockroach Control</li>
              <li>Termite &amp; Bed Bug Control</li>
              <li>Flies Control</li>
            </ul>
          </li>
          <li><b>Plant Growth &amp; Nutrition</b><br />Enhance plant health and maximize yields with our premium nutrition and growth solutions:
            <ul>
              <li>Growth Promoters &amp; Regulators</li>
              <li>Adjuvants / Spreaders</li>
              <li>Water-Soluble NPK Fertilizers</li>
              <li>Liquid Nutrients (Water Soluble)</li>
              <li>Micronutrients</li>
              <li>Granules / Seaweed Extracts</li>
              <li>Biofertilizers</li>
              <li>Stage-Specific &amp; Crop-Specific Fertilizers</li>
            </ul>
          </li>
          <li><b>High-Quality Seeds</b><br />Choose from a curated selection of high-yield, disease-resistant seeds:
            <ul>
              <li>Vegetable Seeds</li>
              <li>Fruit Seeds</li>
              <li>Flower Seeds</li>
              <li>Leafy Vegetable Seeds</li>
              <li>Field Crop Seeds</li>
            </ul>
          </li>
          <li><b>Pest Monitoring &amp; Control Aids</b><br />Monitor and manage pest activity using modern, eco-friendly tools:
            <ul>
              <li>Pheromone Traps</li>
              <li>Pheromone Lures</li>
              <li>Glue/Gum Sheets</li>
              <li>Fruit/Melon Fly Liquids</li>
            </ul>
          </li>
          <li><b>Spraying Equipment</b><br />Efficient and reliable tools for accurate application of crop inputs:
            <ul>
              <li>Battery Sprayers</li>
              <li>Power Sprayers</li>
              <li>Hand-Operated Sprayers</li>
              <li>Hose Pipes</li>
              <li>Sprayer Parts &amp; Accessories</li>
            </ul>
          </li>
          <li><b>Tools &amp; Farm Accessories</b><br />Farm smarter with durable tools and accessories:
            <ul>
              <li>Hand Tools</li>
              <li>Safety Equipment</li>
              <li>Shade Nets</li>
              <li>Drip Pipes / Laterals</li>
              <li>Drip Irrigation Accessories</li>
            </ul>
          </li>
        </ol>
      </div>
      <h2 style={headingStyle}>Privacy Policy Acknowledgment</h2>
      <div style={sectionStyle}>
        By using Farmestore.in, the user confirms that they have read, understood, and agreed to the terms outlined in the Privacy Policy. The user also acknowledges and accepts the contents of the Privacy Policy as applicable to their use of the website.
      </div>
      <h2 style={headingStyle}>Limited Use</h2>
      <div style={sectionStyle}>
        The User agrees not to reverse engineer, modify, copy, distribute, transmit, display, perform, reproduce, publish, license, create derivative works from, transfer, or sell any information or software obtained from the Website. Limited reproduction and copying of the Website’s content is permitted only with prior written permission from Farm E-Store and with clear attribution identifying Farm E-Store as the source. For the avoidance of doubt, large-scale or repeated reproduction, copying—whether for commercial or non-commercial purposes—or any unauthorized modification of the Website’s content or data is strictly prohibited.
      </div>
      <h2 style={headingStyle}>User Conduct and Rules :</h2>
      <div style={sectionStyle}>
        By using the Website and Services, you agree to act responsibly and use them only for lawful and appropriate purposes. You specifically agree that you will not use the Website or Services to post, upload, transmit, or share any content or material that:
        <ul style={listStyle}>
          <li><b>Harms Others</b><br />Defames, harasses, stalks, threatens, or otherwise violates the legal rights (including rights of privacy and publicity) of others.</li>
          <li><b>Contains Inappropriate Content</b><br />Is unlawful, defamatory, obscene, offensive, indecent, abusive, invasive, profane, or otherwise objectionable.</li>
          <li><b>Violates Intellectual Property Rights</b><br />Includes any software, files, or material protected by intellectual property laws (such as copyright, trademark, or trade secret) unless you own or control the rights or have obtained all necessary permissions.</li>
          <li><b>Introduces Harmful Software</b><br />Contains viruses, malware, corrupted files, or any other similar software or programs that could damage, disrupt, or interfere with the operation of the Website, Services, or another user’s device.</li>
          <li><b>Engages in Misleading Activities</b><br />Includes or promotes unauthorized surveys, contests, pyramid schemes, chain letters, or any deceptive or fraudulent activity.</li>
          <li><b>Violates Distribution Rules</b><br />Downloads or distributes files posted by another user that you know, or reasonably should know, cannot be legally shared.</li>
          <li><b>Manipulates or Misrepresents Information</b><br />Falsifies or removes author attributions, legal notices, or proprietary labels indicating the origin or source of software or other content.</li>
          <li><b>Violates Platform Policies</b><br />Breaches any applicable code of conduct, community guidelines, or other rules relating to specific Services.</li>
          <li><b>Breaks the Law</b><br />Violates any applicable laws or regulations in force within or outside India.</li>
          <li><b>Abuses Terms and Conditions</b><br />Misuses, exploits, or manipulates any terms of this Agreement or other related terms governing your use of the Website.</li>
        </ul>
      </div>
      <h2 style={headingStyle}>Communication :</h2>
      <div style={sectionStyle}>
        By registering your phone number with us, you consent to receive communications from us via phone calls, SMS, or other messaging services. These communications may include transactional updates as well as promotional messages related to our services and offerings.
      </div>
      <h2 style={headingStyle}>User Warranty and Representation :</h2>
      <div style={sectionStyle}>
        The user represents, warrants, and certifies that they are either the rightful owner of the content submitted or have been duly authorized to use such content. The user further affirms that the content does not infringe upon any third party’s intellectual property rights, proprietary rights, or any other legal rights. Additionally, to the best of the user’s knowledge, there is no pending or threatened action, suit, proceeding, or investigation concerning any content—such as trademarks, trade names, service marks, or copyrights—used by the user in connection with the services provided by Farmestore.in.
      </div>
      <h2 style={headingStyle}>Exactness Not Guaranteed :</h2>
      <div style={sectionStyle}>
        Farmestore.in does not guarantee the exactness of the finish, appearance, or other characteristics of the final product as displayed or described on the website. The quality, specifications, or performance of products, services, or other materials purchased through the website may differ from user expectations.<br />
        Variations may occur due to factors such as product availability, manufacturer specifications, differences in quantity standards across brands, or supply chain constraints. As a result, certain aspects of your order—including brand, quantity, or packaging—may need to be modified.
      </div>
      <h2 style={headingStyle}>Intellectual Property Rights :</h2>
      <div style={sectionStyle}>
        <b>a)</b> Unless expressly stated otherwise, or in the case of proprietary material clearly identified as owned by a third party, all intellectual property rights in and related to this website are the exclusive property of Farmestore.in. This includes, without limitation, all rights, title, and interest in copyrights, related rights, patents, utility models, trademarks, trade names, service marks, designs, know-how, trade secrets, inventions (whether patentable or not), goodwill, source code, meta tags, databases, text, content, graphics, icons, and hyperlinks.<br />
        You acknowledge and agree that you shall not use, reproduce, modify, or distribute any content from the Farmestore.in website without prior written authorization from Farmestore.in.<br />
        <b>b)</b> Notwithstanding the foregoing, you expressly retain ownership of, and remain solely responsible for, any content you provide or upload while using our Services. This includes, without limitation, any text, data, information, images, photographs, music, sound, video, or other materials you upload, transmit, or store through the Services.<br />
        However, in relation to the product customization Service (as distinct from other Services such as blogs or forums), you expressly agree that by uploading and posting content to the Website for public viewing and potential reproduction or use by third-party users, you accept the applicable User Terms. By doing so, you grant a non-exclusive license to third parties to use such content.
      </div>
      <h2 style={headingStyle}>Links to Third-Party Sites :</h2>
      <div style={sectionStyle}>
        The Website may contain links to external websites (“Linked Sites”) that are not controlled by Farmestore.in or the Website. Farmestore.in does not endorse, guarantee, or assume any responsibility for the content, accuracy, or updates of any Linked Site, including any links contained within those sites. Furthermore, Farmestore.in shall not be liable for any transmission, communication, or data you may receive from any Linked Site.<br />
        These links are provided solely for your convenience. The inclusion of any Linked Site does not imply endorsement, sponsorship, affiliation, or any association between Farmestore.in (or the Website) and the operators, owners, legal heirs, or assigns of such Linked Sites.<br />
        Users are strongly advised to independently verify the accuracy and reliability of all information found on Linked Sites before relying on it.
      </div>
      <h2 style={headingStyle}>Disclaimer of Warranties/Limitation of Liability :</h2>
      <div style={sectionStyle}>
        <b>a)</b> Farmestore.in has made reasonable efforts to ensure that all information on the Website is accurate. However, Farmestore.in makes no warranties or representations, express or implied, regarding the quality, accuracy, completeness, or reliability of any data, information, products, or services provided through the Website.<br />
        Under no circumstances shall Farmestore.in be liable for any direct, indirect, incidental, consequential, punitive, special, or other damages, including but not limited to loss of profits, data, or use, arising from or related to:<br />
        (i) the use or inability to use any products or services offered;<br />
        (ii) unauthorized access to or alteration of user transmissions or data;<br />
        (iii) any other matters connected with the use of the Website or services.<br />
        Farmestore.in is not responsible for any delays, failures, or interruptions in accessing the Website or related services, including those resulting from periodic maintenance, technical issues, or circumstances beyond its control.<br />
        Users acknowledge and agree that any material or data downloaded from the Website is done at their own risk, and Farmestore.in shall not be liable for any damage to computer systems or loss of data arising from such downloads.<br />
        <b>b)</b> The performance of products available through Farmestore.in is subject to adherence to the manufacturer’s guidelines. Users are advised to carefully read all enclosed product leaflets and instructions prior to use. The use of such information is entirely at the user’s own discretion and risk.
      </div>
      <h2 style={headingStyle}>Indemnification :</h2>
      <div style={sectionStyle}>
        You agree to indemnify, defend, and hold harmless Farmestore.in, its affiliates, officers, directors, employees, and agents from and against any and all losses, liabilities, claims, damages, costs, and expenses (including reasonable legal fees and related disbursements, as well as any applicable interest) arising out of or relating to any breach, violation, or non-performance of any representation, warranty, covenant, or agreement made by you, or any obligation you are required to perform under these Terms.
      </div>
      <h2 style={headingStyle}>Pricing :</h2>
      <div style={sectionStyle}>
        Prices for products are displayed on our Website and are incorporated into these Terms by reference. All prices are quoted in Indian Rupees. Prices, products, and services are subject to change at Farmestore.in’s sole discretion.
      </div>
      <h2 style={headingStyle}>Shipping :</h2>
      <div style={sectionStyle}>
        Title and risk of loss for all products ordered by you shall pass to you upon Farmestore.in’s delivery of the products to the shipping carrier. Rules regarding Cash on Delivery (COD) vary based on transaction value, product type, shipping location, and other relevant factors. Farmestore.in reserves the right to offer or deny COD at its sole discretion in specific cases.
      </div>
      <h2 style={headingStyle}>Termination :</h2>
      <div style={sectionStyle}>
        <b>a)</b> Farmestore.in reserves the right, at its sole and absolute discretion, to suspend or terminate your access to the Website or any Service if it determines that you have breached, violated, abused, or unethically exploited any provision of these Terms, or have otherwise engaged in unethical conduct.<br />
        <b>b)</b> Notwithstanding Section 15.a above, these Terms shall continue in full force and effect indefinitely, until such time as Farmestore.in chooses to terminate them.<br />
        <b>c)</b> Upon termination of your access to the Website or any Service by either you or Farmestore.in, Farmestore.in reserves the right to delete any content or materials associated with your use of the Service, without any liability to you or any third party.<br />
        <b>d)</b> You shall remain responsible for payment of all products or Services ordered prior to termination by either party. Furthermore, you shall be entitled to receive any royalty payments that have accrued to you under the User License Agreement, in accordance with applicable law.
      </div>
      <h2 style={headingStyle}>Governing Law :</h2>
      <div style={sectionStyle}>
        These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of laws principles. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Madanapalle-517325,Andhra Pradesh.
      </div>
      <h2 style={headingStyle}>Severability :</h2>
      <div style={sectionStyle}>
        If any provision of these Terms is found to be invalid or unenforceable, in whole or in part, such invalidity or unenforceability shall apply only to that specific provision or part thereof. The remaining provisions of these Terms shall remain in full force and effect.
      </div>
      <h2 style={headingStyle}>Report Abuse :</h2>
      <div style={sectionStyle}>
        Under these Terms, users are solely responsible for all materials or content they upload to the Website. Users may be held legally liable for their content, including but not limited to defamatory comments or materials that infringe on copyright, trademark, or other intellectual property rights. If you encounter any abuse or violation of these Terms, please report it to <a href="mailto:info@farmestore.in" style={{ color: '#2e7d32', textDecoration: 'underline' }}>info@farmestore.in</a>.
      </div>
    </div>
  </>
);

export default TermsConditions;
