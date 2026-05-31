// =============================================
// FOOTER COMPONENT
// Global footer
// =============================================

import React from 'react';
import './Footer.css';

// ===================================== //
// PASTE ANIMA GENERATED JSX HERE        //
// ===================================== //

/**
 * Footer Component
 *
 * @param {string} copyrightText - override copyright text
 */
const Footer = ({ copyrightText }) => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      {/* ===================================== */}
      {/* PASTE ANIMA GENERATED JSX HERE        */}
      {/* ===================================== */}

      <p className="footer-text">
        {copyrightText ?? `© ${year} FarmConnect. All rights reserved.`}
      </p>

      <nav className="footer-links" aria-label="Footer links">
        {/* PASTE ANIMA FOOTER LINKS JSX HERE */}
      </nav>
    </footer>
  );
};

export default Footer;
