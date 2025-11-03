import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRedirect() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-slate-600">Loading...</div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'system_admin':
      return <Navigate to="/admin/system" replace />;
    case 'departmental_admin':
      return <Navigate to="/admin/department" replace />;
    case 'lecturer_admin':
      return <Navigate to="/admin/lecturer" replace />;
    case 'bursary_admin':
      return <Navigate to="/admin/bursary" replace />;
    default:
      // For other staff/student roles, deny access to admin and show dashboard
      return <Navigate to="/dashboard" replace />;
  }
}
