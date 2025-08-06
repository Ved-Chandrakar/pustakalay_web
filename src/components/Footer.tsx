import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-title">
          Powered by SSIPMT
        </div>
        <div className="footer-version">
          SMRITI PUSTAKALAYA - Version 1.0
        </div>
        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
          2025 SSIPMT Government of Chhattisgarh. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
