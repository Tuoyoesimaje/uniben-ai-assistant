import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import NewsManagementTab from '../components/news/NewsManagementTab';

const emptyAnnouncement = { title: '', content: '' };

const LecturerAdminPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [announcement, setAnnouncement] = useState(emptyAnnouncement);
  // UI state for per-page layout, search and pagination
  const [activeTab, setActiveTab] = useState('courses');
  const [searchTerms, setSearchTerms] = useState({ courses: '' });
  const [coursesPage, setCoursesPage] = useState(1);
  const pageSize = 30;
  const { user } = useAuth();

  const paginate = (arr, page) => {
    if (!Array.isArray(arr)) return [];
    const start = (page - 1) * pageSize;
    return arr.slice(start, start + pageSize);
  };

  const filterBySearch = (arr, term, fields = []) => {
    if (!term) return arr || [];
    const q = term.toLowerCase();
    return (arr || []).filter(item => fields.some(f => {
      const val = f.split('.').reduce((o, k) => o?.[k], item);
      return val && val.toString().toLowerCase().includes(q);
    }));
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/admin/lecturer/courses');
        if (res.data?.success) setCourses(res.data.courses || []);
      } catch (err) {
        console.error('Failed to load lecturer courses', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openAnn = (course) => {
    setCurrentCourse(course);
    setAnnouncement(emptyAnnouncement);
    setShowAnnModal(true);
  };

  const submitAnnouncement = async (e) => {
    e.preventDefault();
    if (!currentCourse) return;
    try {
      const newAnn = { ...announcement, createdAt: new Date() };
      const updatedAnnouncements = [...(currentCourse.announcements || []), newAnn];
  const res = await axios.put(`/api/admin/lecturer/courses/${currentCourse._id}`, { announcements: updatedAnnouncements });
      if (res.data?.success) {
        setCourses(prev => prev.map(c => c._id === res.data.course._id ? res.data.course : c));
        setShowAnnModal(false);
        setCurrentCourse(null);
      }
    } catch (err) {
      console.error('Failed to post announcement', err);
      alert(err.response?.data?.message || 'Failed to post announcement');
    }
  };

  return (
    <AdminLayout title="Lecturer Dashboard">
      <div className="md:flex md:gap-6">
        <aside className="hidden md:block md:w-64">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow p-4 border">
            <h3 className="text-sm font-semibold mb-3">Lecturer</h3>
            <nav className="space-y-1">
              <button onClick={() => setActiveTab('courses')} className={`w-full text-left px-3 py-2 rounded ${activeTab==='courses'?'bg-emerald-600 text-white':'text-slate-700 hover:bg-emerald-50'}`}>My Courses</button>
              <button onClick={() => setActiveTab('news')} className={`w-full text-left px-3 py-2 rounded ${activeTab==='news'?'bg-emerald-600 text-white':'text-slate-700 hover:bg-emerald-50'}`}>News</button>
            </nav>
          </div>
        </aside>

        <div className="flex-1">
          <div className="md:hidden mb-4">
            <div className="flex gap-2 overflow-x-auto">
              {['courses'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-shrink-0 px-3 py-2 rounded ${activeTab===tab? 'bg-emerald-600 text-white':'bg-white/90 text-slate-700'}`}>
                  {tab[0].toUpperCase()+tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow p-4 border mb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-[#0f172a]">Lecturer Dashboard</h1>
                <p className="text-sm text-slate-600">Manage your assigned courses.</p>
              </div>

              <div className="flex items-center gap-3">
                <input placeholder={`Search ${activeTab}`} className="input w-60" value={searchTerms.courses} onChange={(e) => setSearchTerms(prev => ({ ...prev, courses: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow p-4 border">
            {activeTab === 'courses' && (
              <div>
                <h2 className="font-semibold mb-3">My Assigned Courses</h2>
                {loading ? (
                  <p className="text-slate-600">Loading...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                      <thead>
                        <tr>
                          <th className="px-3 py-2">Code</th>
                          <th className="px-3 py-2">Title</th>
                          <th className="px-3 py-2">Level</th>
                          <th className="px-3 py-2">Department</th>
                          <th className="px-3 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginate(filterBySearch(courses, searchTerms.courses, ['code','title','department.name']), coursesPage).map(c => (
                          <tr key={c._id} className="border-t">
                            <td className="px-3 py-2">{c.code}</td>
                            <td className="px-3 py-2">{c.title}</td>
                            <td className="px-3 py-2">{c.level}</td>
                            <td className="px-3 py-2">{c.department?.name ?? '-'}</td>
                            <td className="px-3 py-2">
                              <button onClick={() => openAnn(c)} className="mr-2 text-blue-600 hover:underline">Post Announcement</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {filterBySearch(courses, searchTerms.courses, ['code','title','department.name']).length > pageSize && (
                  <div className="mt-3 flex justify-end items-center gap-2">
                    <button onClick={() => setCoursesPage(Math.max(1, coursesPage-1))} className="px-3 py-1 border rounded">Prev</button>
                    <div className="text-sm">Page {coursesPage} of {Math.ceil(filterBySearch(courses, searchTerms.courses, ['code','title','department.name']).length / pageSize)}</div>
                    <button onClick={() => setCoursesPage(Math.min(Math.ceil(filterBySearch(courses, searchTerms.courses, ['code','title','department.name']).length / pageSize), coursesPage+1))} className="px-3 py-1 border rounded">Next</button>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'news' && (
              <div>
                <NewsManagementTab user={user} />
              </div>
            )}
          </div>
        </div>
      </div>

        {showAnnModal && currentCourse && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-lg font-semibold mb-4">Post Announcement - {currentCourse.code}</h3>
              <form onSubmit={submitAnnouncement}>
                <div className="grid grid-cols-1 gap-3">
                  <input name="title" value={announcement.title} onChange={(e) => setAnnouncement(prev => ({ ...prev, title: e.target.value }))} placeholder="Title" className="input" required />
                  <textarea name="content" value={announcement.content} onChange={(e) => setAnnouncement(prev => ({ ...prev, content: e.target.value }))} placeholder="Content" className="input h-32" required />
                </div>
                <div className="mt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => { setShowAnnModal(false); setCurrentCourse(null); }} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Post</button>
                </div>
              </form>
            </div>
          </div>
        )}
    </AdminLayout>
  );
};

export default LecturerAdminPage;
