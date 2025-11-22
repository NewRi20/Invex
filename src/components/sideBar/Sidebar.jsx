import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tag,
  FileText,
  LogOut,
  User,
  
} from 'lucide-react';
import './sidebar.css';
import { useAuth } from '../../AuthProvider';

const Sidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const [open, setOpen] = React.useState(false);

  // Close sidebar on large screens
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024 && open) setOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open]);

  // Toggle sidebar in response to header hamburger
  React.useEffect(() => {
    const handler = () => setOpen(v => !v);
    window.addEventListener('toggleSidebar', handler);
    return () => window.removeEventListener('toggleSidebar', handler);
  }, []);

  // Close sidebar when navigating
  React.useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/pricing', icon: Tag, label: 'Pricing' },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/profile', icon: User, label: 'Profile' },
    
  ];

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <div className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h1 className="sidebar-title">Invex</h1>
      </div>
      <nav>
        <ul className="nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            // 4. Fixed the 'isActive' logic to be more robust
            // This now works for /inventory, /reports, and any sub-pages.
            const isActive = location.pathname.startsWith(item.path);
            
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

          {/* 5. Added a real Logout button as a separate list item */}
          <li className="nav-item">
            <button className="nav-link" onClick={signOut}>
              <LogOut className="nav-icon" size={38} />
              Logout
            </button>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <p className="sidebar-footer-text">
          Developed by Irwen Fronda
        </p>
      </div>
      </div>
    </>
  );
};

export default Sidebar;
