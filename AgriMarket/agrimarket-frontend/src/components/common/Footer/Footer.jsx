import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="home-footer">
      <div className="footer-container">
        <div className="footer-left">
          <div className="footer-logo">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="logo-tractor"
            >
              <circle cx="7" cy="18" r="2"></circle>
              <circle cx="18" cy="18" r="2"></circle>
              <path d="M7 16h11v-2H9v-3h7V9H9V6H7v10z"></path>
              <path d="M16 9h3l2 3v4"></path>
            </svg>
            <span className="logo-text">AgriMarket</span>
          </div>
          <p className="footer-copy">© 2026 AgriMarket. Kết nối Nông nghiệp số.</p>
        </div>
        <div className="footer-right">
          <Link to="/help" className="footer-link">Trung tâm trợ giúp</Link>
          <Link to="/privacy" className="footer-link">Chính sách bảo mật</Link>
          <Link to="/terms" className="footer-link">Điều khoản dịch vụ</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
