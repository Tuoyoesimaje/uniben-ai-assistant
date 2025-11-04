import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import NewsManagementTab from '../components/news/NewsManagementTab';

const emptyOfferingForm = {
  courseId: '',
  level: 100,
  lecturerId: '',
  scheduleDays: [],
  scheduleTime: '',
  semester: 'both',
  venue: '',
  maxStudents: ''
};

const DepartmentAdminPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lecturers, setLecturers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState(emptyOfferingForm);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  // local UI state for per-page nav, search and pagination
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('offerings');
  const [searchTerms, setSearchTerms] = useState({ offerings: '' });
  const [offeringsPage, setOfferingsPage] = useState(1);
  const pageSize = 30;

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
        const res = await axios.get('/api/admin/courses');
        if (res.data?.success) setCourses(res.data.courses || []);
        // load department lecturers for dropdowns
        try {
          const lecRes = await axios.get('/api/admin/department/lecturers');
          if (lecRes.data?.success) setLecturers(lecRes.data.lecturers || []);
        } catch (e) {
          console.warn('Failed to load lecturers', e);
        }
      } catch (err) {
        console.error('Failed to load department courses', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openCreate = () => {
    setCreateForm(emptyOfferingForm);
    setShowCreateModal(true);
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleCreateDay = (day) => {
    setCreateForm(prev => {
      const days = new Set(prev.scheduleDays || []);
      if (days.has(day)) days.delete(day); else days.add(day);
      return { ...prev, scheduleDays: Array.from(days) };
    });
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const { courseId, level, lecturerId, semester, venue, maxStudents } = createForm;
      if (!courseId) return alert('Base Course ID is required');

      const offering = {
        level: Number(level || 100),
        lecturerId: lecturerId || null,
        schedule: { days: createForm.scheduleDays || [], time: createForm.scheduleTime || '' },
        semester: semester || 'both',
        venue: venue || null,
        maxStudents: maxStudents ? Number(maxStudents) : undefined
      };

      const res = await axios.put(`/api/admin/department/courses/${courseId}`, { departments_offering: [offering] });
      if (res.data?.success) {
        setCourses(prev => [res.data.course, ...prev.filter(c => c._id !== res.data.course._id)]);
        setShowCreateModal(false);
        setCreateForm(emptyOfferingForm);
      }
    } catch (err) {
      console.error('Create offering failed', err);
      alert(err.response?.data?.message || 'Failed to create offering');
    } finally {
      setActionLoading(false);
    }
  };

  const openEdit = (course) => {
    const offering = (course.departments_offering || []).find(o => {
      const deptId = o.department?._id || o.department;
      return deptId === user.department;
    });

    const merged = {
      ...course,
      offeringId: offering?._id || null,
      level: offering?.level || course.level || 100,
      lecturerId: offering?.lecturerId?._id || offering?.lecturerId || '',
      schedule: offering?.schedule || '',
      scheduleDays: offering?.schedule?.days || [],
      scheduleTime: offering?.schedule?.time || '',
      semester: offering?.semester || 'both',
      venue: offering?.venue || '',
      maxStudents: offering?.maxStudents || '',
      isActive: offering?.isActive !== undefined ? offering.isActive : true
    };

    setEditingCourse(merged);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingCourse(prev => ({ ...prev, [name]: value }));
  };

  const toggleEditDay = (day) => {
    setEditingCourse(prev => {
      const days = new Set(prev.scheduleDays || []);
      if (days.has(day)) days.delete(day); else days.add(day);
      return { ...prev, scheduleDays: Array.from(days) };
    });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const body = { ...editingCourse };
      const allowedFields = (({ lecturerId, schedule, semester, venue, maxStudents, isActive }) => ({ lecturerId, schedule, semester, venue, maxStudents, isActive }))(body);

      const departments_offering = [{
        department: user.department,
        level: body.level || 100,
        lecturerId: allowedFields.lecturerId || null,
        schedule: { days: body.scheduleDays || [], time: body.scheduleTime || '' },
        semester: allowedFields.semester || 'both',
        venue: allowedFields.venue || null,
        maxStudents: allowedFields.maxStudents,
        isActive: allowedFields.isActive
      }];

      const res = await axios.put(`/api/admin/department/courses/${editingCourse._id}`, { departments_offering });
      if (res.data?.success) {
        setCourses(prev => prev.map(c => c._id === res.data.course._id ? res.data.course : c));
        setShowEditModal(false);
        setEditingCourse(null);
      }
    } catch (err) {
      console.error('Edit offering failed', err);
      alert(err.response?.data?.message || 'Failed to update offering');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteCourse = async (id) => {
    if (!confirm('Delete this course/offering?')) return;
    try {
      const res = await axios.delete(`/api/admin/department/courses/${id}`);
      if (res.data?.success) setCourses(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      console.error('Delete offering failed', err);
      alert(err.response?.data?.message || 'Failed to delete offering');
    }
  };

  const filteredCourses = filterBySearch(courses, searchTerms.offerings, ['code','title','department.name']);
  const totalPages = Math.ceil(filteredCourses.length / pageSize);

  return (
    <AdminLayout title="Department Administration">
      <div className="md:flex md:gap-6">
        {/* Sidebar Navigation */}
        <aside className="hidden md:block md:w-64">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 sticky top-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-sm">school</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Department Admin</h3>
            </div>
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('offerings')} 
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                  activeTab==='offerings' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-sm">menu_book</span>
                <span className="text-sm font-medium">Offerings</span>
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
              {['offerings', 'news'].map(tab => (
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
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Course Offerings</h1>
                <p className="text-slate-600">Manage departmental course offerings and schedules</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">search</span>
                  <input
                    placeholder={`Search ${activeTab}...`}
                    className="w-full sm:w-64 pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    value={searchTerms.offerings}
                    onChange={(e) => setSearchTerms(prev => ({ ...prev, offerings: e.target.value }))}
                  />
                </div>
                <button 
                  onClick={openCreate}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2.5 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <span className="material-symbols-outlined">add</span>
                  Create Offering
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            {activeTab === 'offerings' && (
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-slate-600">Loading offerings...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-slate-800">Course Offerings</h2>
                      <span className="text-sm text-slate-500">{filteredCourses.length} total</span>
                    </div>
                    
                    {filteredCourses.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="material-symbols-outlined text-3xl text-slate-400">menu_book</span>
                        </div>
                        <h3 className="text-lg font-medium text-slate-800 mb-2">No offerings found</h3>
                        <p className="text-slate-600 mb-4">
                          {searchTerms.offerings ? 'Try adjusting your search terms' : 'Get started by creating your first offering'}
                        </p>
                        {!searchTerms.offerings && (
                          <button 
                            onClick={openCreate}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200"
                          >
                            Create First Offering
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="text-left py-3 px-4 font-semibold text-slate-800">Code</th>
                              <th className="text-left py-3 px-4 font-semibold text-slate-800">Title</th>
                              <th className="text-left py-3 px-4 font-semibold text-slate-800">Level</th>
                              <th className="text-left py-3 px-4 font-semibold text-slate-800">Lecturer</th>
                              <th className="text-left py-3 px-4 font-semibold text-slate-800">Semester</th>
                              <th className="text-left py-3 px-4 font-semibold text-slate-800">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginate(filteredCourses, offeringsPage).map(c => {
                              const offering = (c.departments_offering || []).find(o => {
                                const deptId = o.department?._id || o.department;
                                return String(deptId) === String(user.department);
                              });
                              
                              let lecturerName = '-';
                              if (offering?.lecturerId) {
                                if (typeof offering.lecturerId === 'object' && offering.lecturerId.name) {
                                  lecturerName = offering.lecturerId.name;
                                } else {
                                  const found = lecturers.find(l => String(l._id) === String(offering.lecturerId));
                                  if (found) lecturerName = found.name;
                                }
                              } else if (c.lecturer?.name) {
                                lecturerName = c.lecturer.name;
                              }
                              
                              const displayLevel = offering?.level || c.level;
                              const displaySemester = offering?.semester || c.semester;
                              
                              return (
                                <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-200">
                                  <td className="py-4 px-4">
                                    <div className="font-medium text-slate-800">{c.code}</div>
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="text-slate-700">{c.title}</div>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                      Level {displayLevel}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="text-slate-700">{lecturerName}</div>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                      {displaySemester}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="flex gap-2">
                                      <button 
                                        onClick={() => openEdit(c)} 
                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1"
                                      >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                        Edit
                                      </button>
                                      <button 
                                        onClick={() => deleteCourse(c._id)} 
                                        className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1"
                                      >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-slate-600">
                          Showing {((offeringsPage - 1) * pageSize) + 1} to {Math.min(offeringsPage * pageSize, filteredCourses.length)} of {filteredCourses.length} results
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setOfferingsPage(Math.max(1, offeringsPage-1))}
                            disabled={offeringsPage === 1}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            Previous
                          </button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (offeringsPage <= 3) {
                                pageNum = i + 1;
                              } else if (offeringsPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = offeringsPage - 2 + i;
                              }
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setOfferingsPage(pageNum)}
                                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    offeringsPage === pageNum
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
                            onClick={() => setOfferingsPage(Math.min(totalPages, offeringsPage+1))}
                            disabled={offeringsPage === totalPages}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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

      {/* Create Offering Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-sm">add</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">Create Course Offering</h3>
                </div>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            
            <form onSubmit={submitCreate} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Base Course ID *</label>
                  <input 
                    name="courseId" 
                    value={createForm.courseId} 
                    onChange={handleCreateChange} 
                    placeholder="Enter course ID" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Level</label>
                  <input 
                    name="level" 
                    type="number" 
                    value={createForm.level} 
                    onChange={handleCreateChange} 
                    placeholder="100" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Lecturer</label>
                  <select 
                    name="lecturerId" 
                    value={createForm.lecturerId} 
                    onChange={handleCreateChange} 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  >
                    <option value="">(unassigned)</option>
                    {lecturers.map(l => (
                      <option key={l._id} value={l._id}>
                        {l.name} {l.staffId ? `(${l.staffId})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Semester</label>
                  <select 
                    name="semester" 
                    value={createForm.semester} 
                    onChange={handleCreateChange} 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  >
                    <option value="both">Both</option>
                    <option value="first">First</option>
                    <option value="second">Second</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Venue</label>
                  <input 
                    name="venue" 
                    value={createForm.venue} 
                    onChange={handleCreateChange} 
                    placeholder="Venue (optional)" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Max Students</label>
                  <input 
                    name="maxStudents" 
                    type="number" 
                    value={createForm.maxStudents} 
                    onChange={handleCreateChange} 
                    placeholder="Max students (optional)" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Time</label>
                  <input 
                    name="scheduleTime" 
                    type="time" 
                    value={createForm.scheduleTime || ''} 
                    onChange={handleCreateChange} 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-3">Days of Week</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => (
                      <label 
                        key={d} 
                        className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                          createForm.scheduleDays?.includes(d)
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={createForm.scheduleDays?.includes(d)} 
                          onChange={() => toggleCreateDay(d)} 
                        />
                        <span className="text-sm font-medium">{d}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)} 
                  className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2.5 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">add</span>
                      Create Offering
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Offering Modal */}
      {showEditModal && editingCourse && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-sm">edit</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">Edit Offering - {editingCourse.code}</h3>
                </div>
                <button 
                  onClick={() => { setShowEditModal(false); setEditingCourse(null); }}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            
            <form onSubmit={submitEdit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Lecturer</label>
                  <select 
                    name="lecturerId" 
                    value={editingCourse.lecturerId || ''} 
                    onChange={handleEditChange} 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  >
                    <option value="">(unassigned)</option>
                    {lecturers.map(l => (
                      <option key={l._id} value={l._id}>
                        {l.name} {l.staffId ? `(${l.staffId})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Level</label>
                  <input 
                    name="level" 
                    type="number" 
                    value={editingCourse.level} 
                    onChange={handleEditChange} 
                    placeholder="100" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Semester</label>
                  <select 
                    name="semester" 
                    value={editingCourse.semester || 'both'} 
                    onChange={handleEditChange} 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  >
                    <option value="both">Both</option>
                    <option value="first">First</option>
                    <option value="second">Second</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Venue</label>
                  <input 
                    name="venue" 
                    value={editingCourse.venue || ''} 
                    onChange={handleEditChange} 
                    placeholder="Venue" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Max Students</label>
                  <input 
                    name="maxStudents" 
                    type="number" 
                    value={editingCourse.maxStudents || ''} 
                    onChange={handleEditChange} 
                    placeholder="Max students" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Time</label>
                  <input 
                    name="scheduleTime" 
                    type="time" 
                    value={editingCourse.scheduleTime || ''} 
                    onChange={handleEditChange} 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-3">Days of Week</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => (
                      <label 
                        key={d} 
                        className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                          editingCourse.scheduleDays?.includes(d)
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={editingCourse.scheduleDays?.includes(d)} 
                          onChange={() => toggleEditDay(d)} 
                        />
                        <span className="text-sm font-medium">{d}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <input 
                      type="checkbox" 
                      name="isActive" 
                      checked={editingCourse.isActive !== false} 
                      onChange={(e) => setEditingCourse(prev => ({ ...prev, isActive: e.target.checked }))} 
                      className="w-4 h-4 text-emerald-500 border-slate-300 rounded focus:ring-emerald-500" 
                    />
                    <span className="text-sm font-medium text-slate-700">Active Offering</span>
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => { setShowEditModal(false); setEditingCourse(null); }} 
                  className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2.5 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">save</span>
                      Save Changes
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

export default DepartmentAdminPage;
