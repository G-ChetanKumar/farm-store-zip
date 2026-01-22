import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import farmLogo from "../assets/logo34.png";
import googleplay from "../assets/googleplay.webp";
import facebookIcon from "../assets/facebook1.png";
import twitterIcon from "../assets/twitter.png";
import instagramIcon from "../assets/instagram.png";
import youtubeIcon from "../assets/youtube.png";
import linkedinIcon from "../assets/linkedin.png";
import whatsappIcon from "../assets/whatsapp.png";

const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-white pt-6 pb-2 border-t border-gray-300">
      <div className="container mx-auto px-4 flex flex-col md:flex-row">
        {/* Left Section */}
        <div className="flex flex-col items-start">
          <img src={farmLogo} alt="Farm E-Store Logo" className="w-40 h-auto" />
          <div className="flex flex-col items-start">
            <span className="text-md font-semibold">{t('footer.downloadApp')}</span>
            <img
              src={googleplay}
              alt="Download on Google Play"
              className="w-32"
            />
          </div>
          <span className="text-sm font-semibold">{t('footer.socialLinks')}</span>
          <div className="flex space-x-2">
            <img src={facebookIcon} alt="Facebook" className="w-6 h-6" />
            <img src={instagramIcon} alt="Instagram" className="w-6 h-6" />
            <img src={twitterIcon} alt="Twitter" className="w-6 h-6" />
            <img src={youtubeIcon} alt="YouTube" className="w-6 h-6" />
            <img src={linkedinIcon} alt="LinkedIn" className="w-6 h-6" />
          </div>
        </div>
        <br />

        {/* Middle Section */}
        <div className="flex border-l border-gray-300 pl-4 ml-4">
          {/* Links Section */}
          <div className="flex flex-col pr-4 border-r border-gray-300">
            <a href="/Aboutus" className="text-sm hover:text-green-600 mb-1">
              {t('footer.aboutUs')}
            </a>
            <a href="/Contactus" className="text-sm hover:text-green-600 mb-1">
              {t('footer.contactUs')}
            </a>
            <a href="/Privacypolicy" className="text-sm hover:text-green-600 mb-1">
              {t('footer.privacyPolicy')}
            </a>
            <a href="/terms-conditions" className="text-sm hover:text-green-600 mb-1">
              {t('footer.termsConditions')}
            </a>
            <a href="/Refundpolicy" className="text-sm hover:text-green-600 mb-1">
              {t('footer.returnRefundPolicy')}
            </a>
            <a href="/Shippingpolicy" className="text-sm hover:text-green-600 mb-1">
              {t('footer.shippingPolicy')}
            </a>
            <a href="/Careers" className="text-sm hover:text-green-600 mb-1">
              {t('footer.careers')}
            </a>
            <a href="/Faq" className="text-sm hover:text-green-600 mb-1">
              {t('footer.faq')}
            </a>
          </div>

          {/* Registered Office Section */}
          <div className="flex flex-col pl-4">
            <p className="text-sm font-semibold mb-1">{t('footer.registeredOffice')}</p>
            <p className="text-sm mb-1">{t('footer.companyName')}</p>
            <p className="text-sm mb-1">6/237-G-8-K Devalam Street</p>
            <p className="text-sm mb-1">Extn.Ward No:6,</p>
            <p className="text-sm mb-1">Madanapalle-517325</p>
            <p className="text-sm mb-1">Annamayya District,</p>
            <p className="text-sm mb-1">Andhra Pradesh.</p>
            <p className="text-sm">CIN : U74999AP2022PTC121551</p>
          </div>
        </div>

        {/* Empty Space in the Middle */}
        <div className="flex-grow"></div>

        {/* Right Section */}
        <div className="flex flex-col items-center border-l border-gray-300 pl-4">
          <span className="font-semibold text-md text-green-700 mb-1">
            {t('footer.callToOrder')}
          </span>
          <a
            href="tel:9010189891"
            className="bg-orange-400 text-white px-4 py-1 rounded text-lg font-semibold mb-4 inline-block"
          >
            9010189891
          </a>
          <a
            href="https://wa.me/9010189891"
            target="_blank"
            rel="noopener noreferrer"
            className="items-center mt-4 space-x-2 text-green-700 font-semibold text-sm md:text-base"
          >
            <span>{t('footer.whatsappToOrder')}</span>
            <center>
              <img src={whatsappIcon} alt="WhatsApp" className="w-10 h-10" />
            </center>
          </a>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="bg-green-600 text-white py-2 mt-6 text-center text-sm">
        {t('footer.copyright')}
      </div>
    </footer>
  );
};

export default Footer;