import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="new-footer">
      <div className="footer-columns">
        <div className="footer-column footer-brand">
          <h3 className="footer-brand-title">AgriMarket Việt Nam</h3>
          <p className="footer-brand-desc">
            Kênh thương mại điện tử chuyên biệt cho nông nghiệp Việt, kết nối trực tiếp nhà vườn và người tiêu dùng.
          </p>
          <div className="footer-social-icons">
            <a href="#" className="social-icon" aria-label="Website">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </a>
            <a href="#" className="social-icon" aria-label="Globe">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7" />
                <path d="M16 19h6M19 16l3 3-3 3" />
              </svg>
            </a>
            <a href="#" className="social-icon" aria-label="Mail">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-column">
          <h4 className="footer-col-title">DANH MỤC NỔI BẬT</h4>
          <ul className="footer-links">
            <li>
              <Link to="/products/listing?category=Rau%20c%E1%BB%A7%20qu%E1%BA%A3">
                Rau củ quả sạch
              </Link>
            </li>
            <li>
              <Link to="/products/listing?category=Tr%C3%A1i%20c%C3%A2y">
                Trái cây tươi ngon
              </Link>
            </li>
            <li>
              <Link to="/products/listing?category=C%C3%A2y%20l%C6%B0%C6%A1ng%20th%E1%BB%B1c">
                Gạo & Ngũ cốc sạch
              </Link>
            </li>
            <li>
              <Link to="/products/listing?category=N%C3%B4ng%20s%E1%BA%A3n%20ch%E1%BA%BF%20bi%E1%BA%BFn">
                Nông sản chế biến
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-col-title">THÔNG TIN LIÊN HỆ</h4>
          <ul className="footer-contact-info">
            <li className="footer-contact-item">
              <span className="icon">📍</span>
              <span>268 Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh</span>
            </li>
            <li className="footer-contact-item">
              <span className="icon">📞</span>
              <span>Hotline: 1900 6789 (8:00 - 21:00)</span>
            </li>
            <li className="footer-contact-item">
              <span className="icon">✉️</span>
              <span>Email: hotro@agrimarket.vn</span>
            </li>
            <li className="footer-contact-item">
              <span className="icon">🧑‍🌾</span>
              <span>Hợp tác nhà vườn: <strong className="footer-contact-highlight">0909 123 456</strong></span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2024 AgriMarket Việt Nam. Kết nối bền vững.</p>
      </div>
    </footer>
  );
};

export default Footer;
