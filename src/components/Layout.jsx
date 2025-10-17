import React from 'react';
import Sidebar from './sideBar/Sidebar';
import Header from './Header';

const Layout = ({ children, title }) => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Header title={title} />
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
