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
    try {
      // departmental admin creates an offering by referencing a base course id
      const { courseId, level, lecturerId, semester, venue, maxStudents } = createForm;
      if (!courseId) return alert('Base Course ID is required');

      // Use PUT to add a departments_offering to the base course. The server will
      // default the offering.department to the current admin's department if omitted.
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
        // server returns the updated base course; show updated view by reloading list
        setCourses(prev => [res.data.course, ...prev.filter(c => c._id !== res.data.course._id)]);
        setShowCreateModal(false);
      }
    } catch (err) {
      console.error('Create offering failed', err);
      alert(err.response?.data?.message || 'Failed to create offering');
    }
  };

  const openEdit = (course) => {
    // Merge the department-specific offering into the editable object so
    // departmental admins edit their offering (not the base course fields).
    const offering = (course.departments_offering || []).find(o => {
      // department may be stored as id or populated object
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
    try {
      const body = { ...editingCourse };
      // Only send fields that the departmental admin is allowed to change for their offering
      const allowedFields = (({ lecturerId, schedule, semester, venue, maxStudents, isActive }) => ({ lecturerId, schedule, semester, venue, maxStudents, isActive }))(body);

      // For departmental edits, prefer to send a departments_offering array so the server
      // updates the department-specific offering (not the base course document).
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

  return (
    <AdminLayout title="Department Administration">
      <div className="md:flex md:gap-6">
        <aside className="hidden md:block md:w-64">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow p-4 border">
            <h3 className="text-sm font-semibold mb-3">Department Admin</h3>
            <nav className="space-y-1">
              <button onClick={() => setActiveTab('offerings')} className={`w-full text-left px-3 py-2 rounded ${activeTab==='offerings'?'bg-emerald-600 text-white':'text-slate-700 hover:bg-emerald-50'}`}>Offerings</button>
              <button onClick={() => setActiveTab('news')} className={`w-full text-left px-3 py-2 rounded ${activeTab==='news'?'bg-emerald-600 text-white':'text-slate-700 hover:bg-emerald-50'}`}>News</button>
            </nav>
          </div>
        </aside>

        <div className="flex-1">
          <div className="md:hidden mb-4">
            <div className="flex gap-2 overflow-x-auto">
              {['offerings'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-shrink-0 px-3 py-2 rounded ${activeTab===tab? 'bg-emerald-600 text-white':'bg-white/90 text-slate-700'}`}>
                  {tab[0].toUpperCase()+tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow p-4 border mb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-[#0f172a]">Department Administration</h1>
                <p className="text-sm text-slate-600">Manage departmental course offerings.</p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  placeholder={`Search ${activeTab}`}
                  className="input w-60"
                  value={searchTerms.offerings}
                  onChange={(e) => setSearchTerms(prev => ({ ...prev, offerings: e.target.value }))}
                />
                <button className="btn-primary" onClick={openCreate}>Create Offering</button>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow p-4 border">
            {activeTab === 'offerings' && (
              <div>
                <h2 className="font-semibold mb-3">Offerings</h2>
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
                          <th className="px-3 py-2">Lecturer</th>
                          <th className="px-3 py-2">Semester</th>
                          <th className="px-3 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginate(filterBySearch(courses, searchTerms.offerings, ['code','title','department.name']), offeringsPage).map(c => {
                          // prefer the offering that belongs to current user's department
                          const offering = (c.departments_offering || []).find(o => {
                            const deptId = o.department?._id || o.department;
                            return String(deptId) === String(user.department);
                          });
                          // Resolve lecturer name: prefer populated offering.lecturerId.name,
                          // otherwise lookup in the loaded `lecturers` list by id,
                          // otherwise fall back to base course lecturer or '-'.
                          let lecturerName = '-';
                          if (offering?.lecturerId) {
                            if (typeof offering.lecturerId === 'object' && offering.lecturerId.name) {
                              lecturerName = offering.lecturerId.name;
                            } else {
                              // lecturerId may be an ObjectId string - try to find in lecturers state
                              const found = lecturers.find(l => String(l._id) === String(offering.lecturerId));
                              if (found) lecturerName = found.name;
                            }
                          } else if (c.lecturer?.name) {
                            lecturerName = c.lecturer.name;
                          }
                          const displayLevel = offering?.level || c.level;
                          const displaySemester = offering?.semester || c.semester;
                          return (
                            <tr key={c._id} className="border-t">
                              <td className="px-3 py-2">{c.code}</td>
                              <td className="px-3 py-2">{c.title}</td>
                              <td className="px-3 py-2">{displayLevel}</td>
                              <td className="px-3 py-2">{lecturerName}</td>
                              <td className="px-3 py-2">{displaySemester}</td>
                              <td className="px-3 py-2">
                                <button onClick={() => openEdit(c)} className="mr-2 text-blue-600 hover:underline">Edit</button>
                                <button onClick={() => deleteCourse(c._id)} className="text-red-600 hover:underline">Delete</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* pagination */}
                {filterBySearch(courses, searchTerms.offerings, ['code','title','department.name']).length > pageSize && (
                  <div className="mt-3 flex justify-end items-center gap-2">
                    <button onClick={() => setOfferingsPage(Math.max(1, offeringsPage-1))} className="px-3 py-1 border rounded">Prev</button>
                    <div className="text-sm">Page {offeringsPage} of {Math.ceil(filterBySearch(courses, searchTerms.offerings, ['code','title','department.name']).length / pageSize)}</div>
                    <button onClick={() => setOfferingsPage(Math.min(Math.ceil(filterBySearch(courses, searchTerms.offerings, ['code','title','department.name']).length / pageSize), offeringsPage+1))} className="px-3 py-1 border rounded">Next</button>
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

        {/* Create offering modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-lg font-semibold mb-4">Create Course Offering</h3>
              <form onSubmit={submitCreate}>
                <div className="grid grid-cols-1 gap-3">
                  <input name="courseId" value={createForm.courseId} onChange={handleCreateChange} placeholder="Base Course ID (required)" className="input" required />
                  <input name="level" type="number" value={createForm.level} onChange={handleCreateChange} placeholder="Level (e.g., 100)" className="input" />
                  <select name="lecturerId" value={createForm.lecturerId} onChange={handleCreateChange} className="input">
                    <option value="">(unassigned)</option>
                    {lecturers.map(l => (
                      <option key={l._id} value={l._id}>{l.name} {l.staffId ? `(${l.staffId})` : ''}</option>
                    ))}
                  </select>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Days of Week</label>
                    <div className="flex gap-2 flex-wrap">
                      {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => (
                        <label key={d} className={`px-2 py-1 border rounded ${createForm.scheduleDays?.includes(d)?'bg-emerald-100 border-emerald-300':''}`}>
                          <input type="checkbox" className="mr-2" checked={createForm.scheduleDays?.includes(d)} onChange={() => toggleCreateDay(d)} />{d}
                        </label>
                      ))}
                    </div>
                    <div>
                      <label className="text-sm font-medium">Time</label>
                      <input name="scheduleTime" type="time" value={createForm.scheduleTime || ''} onChange={handleCreateChange} className="input" />
                    </div>
                  </div>
                  <select name="semester" value={createForm.semester} onChange={handleCreateChange} className="input">
                    <option value="both">Both</option>
                    <option value="first">First</option>
                    <option value="second">Second</option>
                  </select>
                  <input name="venue" value={createForm.venue} onChange={handleCreateChange} placeholder="Venue (optional)" className="input" />
                  <input name="maxStudents" type="number" value={createForm.maxStudents} onChange={handleCreateChange} placeholder="Max students (optional)" className="input" />
                </div>
                <div className="mt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Create Offering</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit offering modal */}
        {showEditModal && editingCourse && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-lg font-semibold mb-4">Edit Offering - {editingCourse.code}</h3>
              <form onSubmit={submitEdit}>
                <div className="grid grid-cols-1 gap-3">
                  <select name="lecturerId" value={editingCourse.lecturerId || ''} onChange={handleEditChange} className="input">
                    <option value="">(unassigned)</option>
                    {lecturers.map(l => (
                      <option key={l._id} value={l._id}>{l.name} {l.staffId ? `(${l.staffId})` : ''}</option>
                    ))}
                  </select>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Days of Week</label>
                    <div className="flex gap-2 flex-wrap">
                      {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => (
                        <label key={d} className={`px-2 py-1 border rounded ${editingCourse.scheduleDays?.includes(d)?'bg-emerald-100 border-emerald-300':''}`}>
                          <input type="checkbox" className="mr-2" checked={editingCourse.scheduleDays?.includes(d)} onChange={() => toggleEditDay(d)} />{d}
                        </label>
                      ))}
                    </div>
                    <div>
                      <label className="text-sm font-medium">Time</label>
                      <input name="scheduleTime" type="time" value={editingCourse.scheduleTime || ''} onChange={handleEditChange} className="input" />
                    </div>
                  </div>
                  <select name="semester" value={editingCourse.semester || 'both'} onChange={handleEditChange} className="input">
                    <option value="both">Both</option>
                    <option value="first">First</option>
                    <option value="second">Second</option>
                  </select>
                  <input name="venue" value={editingCourse.venue || ''} onChange={handleEditChange} placeholder="Venue" className="input" />
                  <input name="maxStudents" type="number" value={editingCourse.maxStudents || ''} onChange={handleEditChange} placeholder="Max students" className="input" />
                  <label className="flex items-center gap-2"><input type="checkbox" name="isActive" checked={editingCourse.isActive !== false} onChange={(e) => setEditingCourse(prev => ({ ...prev, isActive: e.target.checked }))} /> Active</label>
                </div>
                <div className="mt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => { setShowEditModal(false); setEditingCourse(null); }} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
    </AdminLayout>
  );
};

export default DepartmentAdminPage;
