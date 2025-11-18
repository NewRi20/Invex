import React from 'react';
import { User } from 'lucide-react';
import './Header.css';
import { Link } from 'react-router-dom';

const Header = ({ title }) => {
  return (
    <header className="header">
      <h1 className="header-title">{title}</h1>
      <Link to="/profile" className="profileIcon">
        <User size={28} /> {/* 3. Add the User icon */}
      </Link>
    </header>
  );
};

export default Header;
