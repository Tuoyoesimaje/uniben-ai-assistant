import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import NewsManagementTab from '../components/news/NewsManagementTab';
import FeesCatalogsTab from '../components/bursary/FeesCatalogsTab';

const BursaryAdminPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
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

  const exportData = async () => {
    setActionLoading(true);
    try {
      const res = await axios.get('/api/admin/bursary/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bursary-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed', err);
      alert('Failed to export data');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredStats = stats && Array.isArray(stats) ? stats.filter(s => {
    if (!searchTerms.overview) return true;
    const searchTerm = searchTerms.overview.toLowerCase();
    return JSON.stringify(s).toLowerCase().includes(searchTerm);
  }) : (stats && typeof stats === 'object' ? [stats] : []);

  return (
    <AdminLayout title="Bursary Administration">
      <div className="md:flex md:gap-6">
        {/* Sidebar Navigation */}
        <aside className="hidden md:block md:w-64">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 sticky top-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-sm">account_balance</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Bursary Admin</h3>
            </div>
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('overview')} 
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                  activeTab==='overview' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-sm">dashboard</span>
                <span className="text-sm font-medium">Overview</span>
              </button>
              <button 
                onClick={() => setActiveTab('news')} 
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                  activeTab==='news' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-sm">article</span>
                <span className="text-sm font-medium">News</span>
              </button>
              <button 
                onClick={() => setActiveTab('catalogs')} 
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                  activeTab==='catalogs' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-sm">description</span>
                <span className="text-sm font-medium">Catalogs</span>
              </button>
            </nav>
          </div>
        </aside>

        <div className="flex-1">
          {/* Mobile Navigation */}
          <div className="md:hidden mb-6">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {['overview', 'news', 'catalogs'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)} 
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab===tab 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' 
                      : 'bg-white/80 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {tab[0].toUpperCase()+tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Header Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Finance Dashboard</h1>
                <p className="text-slate-600">Monitor payments, balances, and financial reports</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">search</span>
                  <input
                    placeholder={`Search ${activeTab}...`}
                    className="w-full sm:w-64 pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    value={searchTerms.overview}
                    onChange={(e) => setSearchTerms(prev => ({ ...prev, overview: e.target.value }))}
                  />
                </div>
                <button 
                  onClick={exportData}
                  disabled={actionLoading}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span className="material-symbols-outlined">download</span>
                  )}
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            {activeTab === 'overview' && (
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-slate-600">Loading financial data...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-slate-800">Financial Overview</h2>
                      <span className="text-sm text-slate-500">{filteredStats.length} records</span>
                    </div>
                    
                    {stats ? (
                      <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined">attach_money</span>
                              </div>
                              <span className="text-xs font-medium opacity-80">Total Paid</span>
                            </div>
                            <div className="text-2xl font-bold mb-1">
                              ₦{(stats.totalPaid ?? stats.total ?? 0).toLocaleString()}
                            </div>
                            <div className="text-xs opacity-80">Total payments received</div>
                          </div>
                          
                          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined">pending</span>
                              </div>
                              <span className="text-xs font-medium opacity-80">Outstanding</span>
                            </div>
                            <div className="text-2xl font-bold mb-1">
                              ₦{(stats.totalBalance ?? 0).toLocaleString()}
                            </div>
                            <div className="text-xs opacity-80">Amount due</div>
                          </div>
                          
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-6 text-white">
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined">trending_up</span>
                              </div>
                              <span className="text-xs font-medium opacity-80">Collection Rate</span>
                            </div>
                            <div className="text-2xl font-bold mb-1">
                              {stats.totalPaid && stats.totalBalance ? 
                                Math.round((stats.totalPaid / (stats.totalPaid + stats.totalBalance)) * 100) 
                                : 0}%
                            </div>
                            <div className="text-xs opacity-80">Payment efficiency</div>
                          </div>
                          
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined">people</span>
                              </div>
                              <span className="text-xs font-medium opacity-80">Total Students</span>
                            </div>
                            <div className="text-2xl font-bold mb-1">
                              {stats.totalStudents ?? 0}
                            </div>
                            <div className="text-xs opacity-80">Enrolled students</div>
                          </div>
                        </div>

                        {/* Detailed Statistics Table */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                          <div className="p-6 border-b border-slate-200 bg-slate-50/50">
                            <h3 className="text-lg font-semibold text-slate-800">Detailed Breakdown</h3>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-slate-50/80">
                                <tr>
                                  <th className="text-left py-4 px-6 font-semibold text-slate-800">Metric</th>
                                  <th className="text-left py-4 px-6 font-semibold text-slate-800">Value</th>
                                  <th className="text-left py-4 px-6 font-semibold text-slate-800">Percentage</th>
                                  <th className="text-left py-4 px-6 font-semibold text-slate-800">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                <tr className="hover:bg-slate-50/50 transition-colors duration-200">
                                  <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                                      </div>
                                      <span className="font-medium text-slate-800">Total Paid</span>
                                    </div>
                                  </td>
                                  <td className="py-4 px-6">
                                    <span className="text-lg font-bold text-emerald-600">
                                      ₦{(stats.totalPaid ?? stats.total ?? 0).toLocaleString()}
                                    </span>
                                  </td>
                                  <td className="py-4 px-6">
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 h-2 bg-emerald-100 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                          style={{ 
                                            width: `${stats.totalPaid && stats.totalBalance ? 
                                              (stats.totalPaid / (stats.totalPaid + stats.totalBalance)) * 100 : 0}%` 
                                          }}
                                        ></div>
                                      </div>
                                      <span className="text-sm text-slate-600">
                                        {stats.totalPaid && stats.totalBalance ? 
                                          Math.round((stats.totalPaid / (stats.totalPaid + stats.totalBalance)) * 100) 
                                          : 0}%
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-4 px-6">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                      Excellent
                                    </span>
                                  </td>
                                </tr>
                                <tr className="hover:bg-slate-50/50 transition-colors duration-200">
                                  <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-amber-600 text-sm">warning</span>
                                      </div>
                                      <span className="font-medium text-slate-800">Total Outstanding</span>
                                    </div>
                                  </td>
                                  <td className="py-4 px-6">
                                    <span className="text-lg font-bold text-amber-600">
                                      ₦{(stats.totalBalance ?? 0).toLocaleString()}
                                    </span>
                                  </td>
                                  <td className="py-4 px-6">
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 h-2 bg-amber-100 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                          style={{ 
                                            width: `${stats.totalPaid && stats.totalBalance ? 
                                              (stats.totalBalance / (stats.totalPaid + stats.totalBalance)) * 100 : 0}%` 
                                          }}
                                        ></div>
                                      </div>
                                      <span className="text-sm text-slate-600">
                                        {stats.totalPaid && stats.totalBalance ? 
                                          Math.round((stats.totalBalance / (stats.totalPaid + stats.totalBalance)) * 100) 
                                          : 0}%
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-4 px-6">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                      {stats.totalBalance > 0 ? 'Needs Attention' : 'Cleared'}
                                    </span>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="material-symbols-outlined text-3xl text-slate-400">account_balance</span>
                        </div>
                        <h3 className="text-lg font-medium text-slate-800 mb-2">No Financial Data</h3>
                        <p className="text-slate-600">Financial statistics will appear here once data is available</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            
            {activeTab === 'news' && (
              <div className="p-6">
                <NewsManagementTab user={user} />
              </div>
            )}
            
            {activeTab === 'catalogs' && (
              <div className="p-6">
                <FeesCatalogsTab user={user} />
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BursaryAdminPage;
