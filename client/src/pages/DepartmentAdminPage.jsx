import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import axios from 'axios';

const emptyOfferingForm = {
  courseId: '',
  level: 100,
  lecturerId: '',
  schedule: '',
  semester: 'both',
  venue: '',
  maxStudents: ''
};

const DepartmentAdminPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState(emptyOfferingForm);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/admin/courses');
        if (res.data?.success) setCourses(res.data.courses || []);
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

  const submitCreate = async (e) => {
    e.preventDefault();
    try {
      // departmental admin creates an offering by referencing a base course id
      const { courseId, level, lecturerId, schedule, semester, venue, maxStudents } = createForm;
      if (!courseId) return alert('Base Course ID is required');

      // Use PUT to add a departments_offering to the base course. The server will
      // default the offering.department to the current admin's department if omitted.
      const offering = { level: Number(level || 100), lecturerId: lecturerId || null, schedule: schedule || null, semester: semester || 'both', venue: venue || null, maxStudents: maxStudents ? Number(maxStudents) : undefined };
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
    setEditingCourse(course);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingCourse(prev => ({ ...prev, [name]: value }));
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const body = { ...editingCourse };
      // Only send fields that the departmental admin is allowed to change for their offering
      const allowed = (({ lecturerId, schedule, semester, venue, maxStudents, isActive, departments_offering }) => ({ lecturerId, schedule, semester, venue, maxStudents, isActive, departments_offering }))(body);
      const res = await axios.put(`/api/admin/courses/${editingCourse._id}`, allowed);
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
      const res = await axios.delete(`/api/admin/courses/${id}`);
      if (res.data?.success) setCourses(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      console.error('Delete offering failed', err);
      alert(err.response?.data?.message || 'Failed to delete offering');
    }
  };

  return (
    <AdminLayout title="Department Administration">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Department Offerings</h2>
          <div>
            <button className="btn-primary" onClick={openCreate}>Create Offering</button>
          </div>
        </div>

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
                {courses.map(c => (
                  <tr key={c._id} className="border-t">
                    <td className="px-3 py-2">{c.code}</td>
                    <td className="px-3 py-2">{c.title}</td>
                    <td className="px-3 py-2">{c.level}</td>
                    <td className="px-3 py-2">{c.lecturerId?.name ?? c.lecturer?.name ?? '-'}</td>
                    <td className="px-3 py-2">{c.semester}</td>
                    <td className="px-3 py-2">
                      <button onClick={() => openEdit(c)} className="mr-2 text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => deleteCourse(c._id)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create offering modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-lg font-semibold mb-4">Create Course Offering</h3>
              <form onSubmit={submitCreate}>
                <div className="grid grid-cols-1 gap-3">
                  <input name="courseId" value={createForm.courseId} onChange={handleCreateChange} placeholder="Base Course ID (required)" className="input" required />
                  <input name="level" type="number" value={createForm.level} onChange={handleCreateChange} placeholder="Level (e.g., 100)" className="input" />
                  <input name="lecturerId" value={createForm.lecturerId} onChange={handleCreateChange} placeholder="Lecturer ID (optional)" className="input" />
                  <input name="schedule" value={createForm.schedule} onChange={handleCreateChange} placeholder="Schedule (optional)" className="input" />
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
                  <input name="lecturerId" value={editingCourse.lecturerId || ''} onChange={handleEditChange} placeholder="Lecturer ID" className="input" />
                  <input name="schedule" value={editingCourse.schedule || ''} onChange={handleEditChange} placeholder="Schedule" className="input" />
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
      </div>
    </AdminLayout>
  );
};

export default DepartmentAdminPage;
