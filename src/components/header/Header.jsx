import React from 'react';
import { User, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = ({ title }) => {
  const handleToggle = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toggleSidebar'));
    }
  };

  return (
    <header className="flex items-center justify-between px-[18px] py-3 lg:px-[35px] lg:py-5">
      <button
        className="hidden cursor-pointer rounded-md p-1.5 text-[color:var(--white)] transition-colors hover:text-white max-[1024px]:inline-flex"
        aria-label="Toggle menu"
        onClick={handleToggle}
      >
        <Menu size={20} />
      </button>
      <h1 className="text-[22px] font-bold text-[color:var(--white)]">{title}</h1>
      <Link to="/profile" className="text-[color:var(--white)] transition-colors hover:text-gray-200" aria-label="Open profile">
        <User size={28} />
      </Link>
    </header>
  );
};

export default Header;
