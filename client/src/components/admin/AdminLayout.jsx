import React from 'react';
import Navbar from '../../components/shared/Navbar';

const AdminLayout = ({ title = 'Admin', children }) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 to-teal-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <header className="mb-4">
            <h1 className="text-2xl font-bold text-[#111816]">{title}</h1>
          </header>
          <main>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
