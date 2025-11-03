import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import axios from 'axios';

const BursaryAdminPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/admin/bursary/stats');
        if (res.data?.success) setStats(res.data.feesStats || res.data.stats || null);
      } catch (err) {
        console.error('Failed to load bursary stats', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AdminLayout title="Bursary / Finance">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Finance Overview</h2>
        {loading ? <p className="text-slate-600">Loading...</p> : (
          stats ? (
            <div className="grid grid-cols-1 gap-3">
              {Array.isArray(stats) ? stats.map((s, i) => (
                <div key={i} className="p-3 border rounded">
                  <div>Total Paid: {(s.totalPaid ?? s.total) ?? 0}</div>
                  <div>Total Outstanding: {s.totalBalance ?? 0}</div>
                </div>
              )) : (
                <div className="p-3 border rounded">
                  <div>Total Paid: {(stats.totalPaid ?? stats.total) ?? 0}</div>
                  <div>Total Outstanding: {stats.totalBalance ?? 0}</div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-600">No stats available</p>
          )
        )}
      </div>
    </AdminLayout>
  );
};

export default BursaryAdminPage;
