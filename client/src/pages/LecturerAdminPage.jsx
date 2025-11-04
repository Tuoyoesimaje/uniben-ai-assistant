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
  const [actionLoading, setActionLoading] = useState(false);
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
    setActionLoading(true);
    try {
      const newAnn = { ...announcement, createdAt: new Date() };
      const updatedAnnouncements = [...(currentCourse.announcements || []), newAnn];
      const res = await axios.put(`/api/admin/lecturer/courses/${currentCourse._id}`, { announcements: updatedAnnouncements });
      if (res.data?.success) {
        setCourses(prev => prev.map(c => c._id === res.data.course._id ? res.data.course : c));
        setShowAnnModal(false);
        setCurrentCourse(null);
        setAnnouncement(emptyAnnouncement);
      }
    } catch (err) {
      console.error('Failed to post announcement', err);
      alert(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCourses = filterBySearch(courses, searchTerms.courses, ['code','title','department.name']);
  const totalPages = Math.ceil(filteredCourses.length / pageSize);

  return (
    <AdminLayout title="Lecturer Dashboard">
      <div className="md:flex md:gap-6">
        {/* Sidebar Navigation */}
        <aside className="hidden md:block md:w-64">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 sticky top-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-sm">school</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Lecturer Admin</h3>
            </div>
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('courses')} 
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                  activeTab==='courses' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-sm">menu_book</span>
                <span className="text-sm font-medium">My Courses</span>
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
            </nav>
          </div>
        </aside>

        <div className="flex-1">
          {/* Mobile Navigation */}
          <div className="md:hidden mb-6">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {['courses', 'news'].map(tab => (
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
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Course Management</h1>
                <p className="text-slate-600">Manage your assigned courses and post announcements</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">search</span>
                  <input
                    placeholder={`Search ${activeTab}...`}
                    className="w-full sm:w-64 pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    value={searchTerms.courses}
                    onChange={(e) => setSearchTerms(prev => ({ ...prev, courses: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            {activeTab === 'courses' && (
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-slate-600">Loading your courses...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-slate-800">My Assigned Courses</h2>
                      <span className="text-sm text-slate-500">{filteredCourses.length} courses</span>
                    </div>
                    
                    {filteredCourses.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="material-symbols-outlined text-3xl text-slate-400">menu_book</span>
                        </div>
                        <h3 className="text-lg font-medium text-slate-800 mb-2">No courses assigned</h3>
                        <p className="text-slate-600">
                          {searchTerms.courses ? 'Try adjusting your search terms' : 'Contact your department admin to get courses assigned'}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginate(filteredCourses, coursesPage).map(c => (
                          <div key={c._id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                                  <span className="material-symbols-outlined text-white">menu_book</span>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-800">{c.code}</h3>
                                  <p className="text-sm text-slate-500">Level {c.level}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <h4 className="font-medium text-slate-800 mb-2">{c.title}</h4>
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <span className="material-symbols-outlined text-sm">business</span>
                                <span>{c.department?.name ?? 'N/A'}</span>
                              </div>
                            </div>

                            {/* Course Statistics */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="text-center">
                                <div className="text-lg font-bold text-emerald-600">{c.announcements?.length || 0}</div>
                                <div className="text-xs text-slate-500">Announcements</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-blue-600">{c.students?.length || 0}</div>
                                <div className="text-xs text-slate-500">Students</div>
                              </div>
                            </div>

                            {/* Action Button */}
                            <button 
                              onClick={() => openAnn(c)}
                              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                            >
                              <span className="material-symbols-outlined text-sm">add_comment</span>
                              Post Announcement
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-8 flex items-center justify-between">
                        <div className="text-sm text-slate-600">
                          Showing {((coursesPage - 1) * pageSize) + 1} to {Math.min(coursesPage * pageSize, filteredCourses.length)} of {filteredCourses.length} courses
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setCoursesPage(Math.max(1, coursesPage-1))}
                            disabled={coursesPage === 1}
                            className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            Previous
                          </button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (coursesPage <= 3) {
                                pageNum = i + 1;
                              } else if (coursesPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = coursesPage - 2 + i;
                              }
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCoursesPage(pageNum)}
                                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    coursesPage === pageNum
                                      ? 'bg-emerald-500 text-white'
                                      : 'text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          <button 
                            onClick={() => setCoursesPage(Math.min(totalPages, coursesPage+1))}
                            disabled={coursesPage === totalPages}
                            className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            Next
                          </button>
                        </div>
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
          </div>
        </div>
      </div>

      {/* Announcement Modal */}
      {showAnnModal && currentCourse && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-sm">add_comment</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800">Post Announcement</h3>
                    <p className="text-sm text-slate-600">Course: {currentCourse.code}</p>
                  </div>
                </div>
                <button 
                  onClick={() => { 
                    setShowAnnModal(false); 
                    setCurrentCourse(null); 
                    setAnnouncement(emptyAnnouncement); 
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            
            <form onSubmit={submitAnnouncement} className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                  <input 
                    name="title" 
                    value={announcement.title} 
                    onChange={(e) => setAnnouncement(prev => ({ ...prev, title: e.target.value }))} 
                    placeholder="Enter announcement title" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
                  <textarea 
                    name="content" 
                    value={announcement.content} 
                    onChange={(e) => setAnnouncement(prev => ({ ...prev, content: e.target.value }))} 
                    placeholder="Enter announcement content..." 
                    rows={6}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none" 
                    required 
                  />
                </div>
                
                {/* Preview Section */}
                {(announcement.title || announcement.content) && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      Preview
                    </h4>
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      {announcement.title && (
                        <h5 className="font-medium text-slate-800 mb-2">{announcement.title}</h5>
                      )}
                      {announcement.content && (
                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{announcement.content}</p>
                      )}
                      <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-2 text-xs text-slate-500">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        <span>Will be posted as: {new Date().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => { 
                    setShowAnnModal(false); 
                    setCurrentCourse(null); 
                    setAnnouncement(emptyAnnouncement); 
                  }} 
                  className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2.5 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={actionLoading || !announcement.title.trim() || !announcement.content.trim()}
                >
                  {actionLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Posting...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">send</span>
                      Post Announcement
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default LecturerAdminPage;
