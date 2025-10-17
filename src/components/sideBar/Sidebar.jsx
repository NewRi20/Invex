import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tag,
  FileText,
  HelpCircle,
  LogOut,
  User
} from 'lucide-react';
import './sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/pricing', icon: Tag, label: 'Pricing' },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/help', icon: HelpCircle, label: 'Help' },
    { path: '/logout', icon: LogOut, label: 'Logout' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Invex</h1>
      </div>
      <nav>
        <ul className="nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path === '/reports' && location.pathname.startsWith('/reports'));
            return (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link${isActive ? ' active' : ''}`}
                >
                  <Icon className="nav-icon" size={38} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <p className="sidebar-footer-text">
          Developed by Invex Fronda
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
