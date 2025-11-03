import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import NewsManagementTab from '../components/news/NewsManagementTab';
import FeesCatalogsTab from '../components/bursary/FeesCatalogsTab';

const BursaryAdminPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  // page UI state
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerms, setSearchTerms] = useState({ overview: '' });

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
      <div className="md:flex md:gap-6">
        <aside className="hidden md:block md:w-64">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow p-4 border">
            <h3 className="text-sm font-semibold mb-3">Bursary</h3>
            <nav className="space-y-1">
              <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-3 py-2 rounded ${activeTab==='overview'?'bg-emerald-600 text-white':'text-slate-700 hover:bg-emerald-50'}`}>Overview</button>
            </nav>
          </div>
        </aside>

        <div className="flex-1">
          <div className="md:hidden mb-4">
              <div className="flex gap-2 overflow-x-auto">
              {['overview','news','catalogs'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-shrink-0 px-3 py-2 rounded ${activeTab===tab? 'bg-emerald-600 text-white':'bg-white/90 text-slate-700'}`}>
                  {tab[0].toUpperCase()+tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow p-4 border mb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-[#0f172a]">Bursary / Finance</h1>
                <p className="text-sm text-slate-600">Payments, balances and reports.</p>
              </div>

              <div className="flex items-center gap-3">
                <input placeholder={`Search ${activeTab}`} className="input w-60" value={searchTerms.overview} onChange={(e) => setSearchTerms(prev => ({ ...prev, overview: e.target.value }))} />
                <button className="btn-primary">Export CSV</button>
              </div>
            </div>
          </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow p-4 border">
            {activeTab === 'overview' && (
              <div>
                <h2 className="font-semibold mb-3">Finance Overview</h2>
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
            )}
            {activeTab === 'news' && (
              <div>
                <NewsManagementTab user={user} />
              </div>
            )}
            {activeTab === 'catalogs' && (
              <div>
                <FeesCatalogsTab />
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BursaryAdminPage;
