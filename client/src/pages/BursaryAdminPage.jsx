import React from 'react';
import AdminLayout from '../components/admin/AdminLayout';

const BursaryAdminPage = () => {
  return (
    <AdminLayout title="Bursary / Finance">
      <div className="p-4">
        <p className="text-slate-600">Bursary dashboard (manage fees, post official financial announcements).</p>
      </div>
    </AdminLayout>
  );
};

export default BursaryAdminPage;
