import React from 'react';
import { User } from 'lucide-react';
import './Header.css';

const Header = ({ title }) => {
  return (
    <header className="header">
      <h1 className="header-title">{title}</h1>
      <span className="profileIcon"></span>
    </header>
  );
};

export default Header;
