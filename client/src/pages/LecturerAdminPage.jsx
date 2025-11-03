import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import axios from 'axios';

const emptyAnnouncement = { title: '', content: '' };

const LecturerAdminPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [announcement, setAnnouncement] = useState(emptyAnnouncement);

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
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Assigned Courses</h2>
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
                  <th className="px-3 py-2">Department</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(c => (
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
      </div>
    </AdminLayout>
  );
};

export default LecturerAdminPage;
