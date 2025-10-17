import React from 'react';
import { User } from 'lucide-react';
import './Header.css';

const Header = ({ title }) => {
  return (
    <header className="header">
      <h1 className="header-title">{title}</h1>
      <span class="profileIcon"></span>
    </header>
  );
};

export default Header;
