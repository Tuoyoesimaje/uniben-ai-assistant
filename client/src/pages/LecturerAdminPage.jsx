import React from 'react';
import AdminLayout from '../components/admin/AdminLayout';

const LecturerAdminPage = () => {
  return (
    <AdminLayout title="Lecturer Dashboard">
      <div className="p-4">
        <p className="text-slate-600">Lecturer dashboard (manage assigned courses, upload materials, post announcements).</p>
      </div>
    </AdminLayout>
  );
};

export default LecturerAdminPage;
