import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-secondary text-white py-4 mt-auto">
      <div className="container text-center">
        <p>© {new Date().getFullYear()} BBQ Restaurant. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;