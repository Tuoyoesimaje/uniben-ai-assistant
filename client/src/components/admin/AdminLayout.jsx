import React from 'react';
import Navbar from '../../components/shared/Navbar';

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 to-teal-100">
      <Navbar />
      <div className="w-full px-4 py-6 max-w-7xl mx-auto">
        <main>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
