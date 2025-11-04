import React from 'react';
import Navbar from '../../components/shared/Navbar';

const AdminLayout = ({ title, children }) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Navbar />
      <div className="w-full px-4 py-6 max-w-7xl mx-auto">
        {/* Page Header */}
        {title && (
          <div className="mb-6 animate-fade-in">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">{title}</h1>
              <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
            </div>
          </div>
        )}
        
        <main className="animate-slide-up">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
