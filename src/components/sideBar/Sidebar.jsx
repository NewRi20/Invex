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
      {open && <div className="fixed inset-0 bg-black/28 z-[1150]" onClick={() => setOpen(false)} />}

      <div className={`fixed left-0 top-0 w-44 bg-slate-900/30 py-5 flex flex-col items-center h-screen overflow-hidden z-[1000] transition-transform duration-200 ${open ? 'max-lg:w-60 max-lg:left-2 max-lg:top-2 max-lg:h-[calc(100vh-16px)] max-lg:rounded-lg max-lg:p-4 max-lg:bg-slate-900/95 max-lg:shadow-2xl' : 'max-lg:translate-x-[-120%]'} max-sm:w-16 max-sm:py-2.5 max-sm:px-0`}>
      <div className="pb-[15px] w-full text-center mb-[15px]">
        <h1 className="text-white text-2xl font-bold tracking-wider mb-0 max-lg:block max-sm:hidden">Invex</h1>
      </div>
      <nav>
        <ul className="list-none p-0 m-0 w-full flex-1 flex flex-col justify-around max-lg:justify-around max-sm:justify-start max-sm:gap-4 max-sm:pt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            // 4. Fixed the 'isActive' logic to be more robust
            // This now works for /inventory, /reports, and any sub-pages.
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <li key={item.path} className="text-center mb-0">
                <Link
                  to={item.path}
                  className={`flex flex-col items-center justify-center gap-1.5 w-full text-white no-underline text-sm font-normal bg-transparent p-0 border-none rounded-none cursor-pointer transition-colors duration-200 ${isActive ? 'text-yellow-400' : ''}`}
                >
                  <Icon className="mb-1 max-lg:block max-sm:mb-0.5" size={38} />
                    {item.label}
                </Link>
              </li>
            );
          })}

          {/* 5. Added a real Logout button as a separate list item */}
          <li className="text-center mb-0">
            <button className="flex flex-col items-center justify-center gap-1.5 w-full text-white text-sm font-normal bg-transparent p-0 border-none rounded-none cursor-pointer transition-colors duration-200 hover:text-yellow-400" onClick={signOut}>
              <LogOut className="mb-1 max-lg:block max-sm:mb-0.5" size={38} />
              Logout
            </button>
          </li>
        </ul>
      </nav>
      <div className="p-3 w-full text-center flex-shrink-0 max-lg:block max-sm:hidden">
        <p className="text-xs text-white text-center opacity-70 leading-snug">
          Developed by Irwen Fronda
        </p>
      </div>
      </div>
    </>
  );
};

export default Sidebar;
