import React from 'react';
import { User } from 'lucide-react';

const Header = ({ title }) => {
  return (
    <header className="header">
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--white)' }}>
        {title}
      </h1>
      <div className="flex-center">
        <User size={24} color="var(--white)" />
      </div>
    </header>
  );
};

export default Header;
