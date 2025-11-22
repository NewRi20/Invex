import React from 'react';
import { User, Menu } from 'lucide-react';
import './Header.css';
import { Link } from 'react-router-dom';

const Header = ({ title }) => {
  const handleToggle = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toggleSidebar'));
    }
  };

  return (
    <header className="header">
      <button className="hamburger" aria-label="Toggle menu" onClick={handleToggle}>
        <Menu size={20} />
      </button>
      <h1 className="header-title">{title}</h1>
      <Link to="/profile" className="profileIcon">
        <User size={28} />
      </Link>
    </header>
  );
};

export default Header;
