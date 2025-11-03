import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Upload, Calendar } from 'lucide-react';

const NewsForm = ({ onClose, onSuccess, editingNews = null }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    audience: 'everyone',
    department: '',
    course: '',
    tags: '',
    priority: 'medium',
    expiresAt: '',
    attachments: []
  });
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lecturerCourses, setLecturerCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingNews) {
      setFormData({
        title: editingNews.title || '',
        content: editingNews.content || '',
        audience: editingNews.audience || 'everyone',
        department: editingNews.department?.id || '',
        course: editingNews.courses ? editingNews.courses.map(c => c._id) : (editingNews.course?.id ? [editingNews.course.id] : ''),
        tags: (editingNews.tags || []).join(', '),
        priority: editingNews.priority || 'medium',
        expiresAt: editingNews.expiresAt ? new Date(editingNews.expiresAt).toISOString().split('T')[0] : '',
        attachments: editingNews.attachments || []
      });
    }
    loadDepartmentsAndCourses();
    if (user.role === 'lecturer_admin') loadLecturerCourses();
  }, [editingNews]);

  const loadDepartmentsAndCourses = async () => {
    try {
      const [deptRes, courseRes] = await Promise.all([
        fetch('/api/admin/departments', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/admin/courses', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (deptRes.ok) {
        const deptData = await deptRes.json();
        setDepartments(deptData.success ? deptData.departments : []);
      }

      if (courseRes.ok) {
        const courseData = await courseRes.json();
        setCourses(courseData.success ? courseData.courses : []);
      }
    } catch (error) {
      console.error('Error loading departments and courses:', error);
    }
  };

  const loadLecturerCourses = async () => {
    try {
      const res = await fetch('/api/admin/lecturer/courses', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (res.ok) {
        const data = await res.json();
        setLecturerCourses(data.success ? data.courses : []);
      }
    } catch (err) {
      console.error('Failed to load lecturer courses', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear related fields when audience changes
    if (name === 'audience') {
      if (value !== 'department_specific') {
        setFormData(prev => ({ ...prev, department: '' }));
      }
      if (value !== 'course_specific') {
        setFormData(prev => ({ ...prev, course: '' }));
      }
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      filename: `${Date.now()}-${file.name}`,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url: '', // Will be set after upload
      uploadedAt: new Date()
    }));

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (formData.audience === 'department_specific' && !formData.department) {
      newErrors.department = 'Department is required for department-specific news';
    }

    if (formData.audience === 'course_specific' && !formData.course) {
      newErrors.course = 'At least one course is required for course-specific news';
    }

    // Check permissions based on user role
    switch (formData.audience) {
      case 'everyone':
        if (!['system_admin', 'bursary_admin'].includes(user.role)) {
          newErrors.audience = 'Only system admin and bursary admin can post university-wide news';
        }
        break;
      case 'students_only':
      case 'staff_only':
        // Allow system-wide students/staff (system_admin, bursary_admin)
        // and allow departmental admins to target students/staff in their own department
        if (!['system_admin', 'bursary_admin', 'departmental_admin'].includes(user.role)) {
          newErrors.audience = 'Only system, bursary or departmental admins can post to students or staff';
        }
        break;
      case 'department_specific':
        if (user.role === 'departmental_admin' && formData.department !== user.department) {
          newErrors.audience = 'You can only post to your assigned department';
        } else if (!['system_admin', 'bursary_admin', 'departmental_admin'].includes(user.role)) {
          newErrors.audience = 'Insufficient permissions to post department news';
        }
        break;
      case 'course_specific':
        if (user.role === 'lecturer_admin' && !user.courses?.includes(formData.course)) {
          newErrors.audience = 'You can only post to your assigned courses';
        } else if (!['system_admin', 'departmental_admin', 'lecturer_admin'].includes(user.role)) {
          newErrors.audience = 'Insufficient permissions to post course news';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const url = editingNews
        ? `/api/news/${editingNews.id}`
        : '/api/news';

      const method = editingNews ? 'PUT' : 'POST';

      // Build payload: for departmental admins posting to students_only or staff_only
      // ensure the department is set to their department so the server applies the scope correctly.
      const payload = { ...formData };
      if ((formData.audience === 'students_only' || formData.audience === 'staff_only') && user.role === 'departmental_admin') {
        payload.department = user.department;
      }

      // For course_specific allow multiple courses (lecturer may post to many)
      if (formData.audience === 'course_specific') {
        payload.courses = Array.isArray(formData.course) ? formData.course : (formData.course ? [formData.course] : []);
        delete payload.course;
      }

      // Include tags normalization (comma-separated string -> array)
      if (typeof payload.tags === 'string') {
        payload.tags = payload.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        onSuccess(result.news);
        onClose();
      } else {
        setErrors({ submit: result.message || 'Failed to save news' });
      }
    } catch (error) {
      console.error('Error saving news:', error);
      setErrors({ submit: 'Failed to save news. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getAvailableAudiences = () => {
    const audiences = [];

    // system and bursary admins can post university-wide
    if (['system_admin', 'bursary_admin'].includes(user.role)) {
      audiences.push({ value: 'everyone', label: 'Everyone (University-wide)' });
    }

    // Allow targeting students/staff either university-wide (system/bursary)
    // or department-scoped (departmental_admin)
    if (['system_admin', 'bursary_admin', 'departmental_admin'].includes(user.role)) {
      audiences.push({ value: 'students_only', label: 'Students Only' });
      audiences.push({ value: 'staff_only', label: 'Staff Only' });
    }

    // Department-specific option (chooses a particular department)
    if (['system_admin', 'bursary_admin', 'departmental_admin'].includes(user.role)) {
      audiences.push({ value: 'department_specific', label: 'Specific Department' });
    }

    // Course-specific option (for lecturers and higher roles). Lecturers can pick one or many of their classes.
    if (['system_admin', 'departmental_admin', 'lecturer_admin'].includes(user.role)) {
      audiences.push({ value: 'course_specific', label: 'Specific Course(s)' });
    }

    return audiences;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingNews ? 'Edit News' : 'Create News'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter news title"
              required
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={6}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                errors.content ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter news content"
              required
            />
            {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
          </div>

          {/* Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audience *
            </label>
            <select
              name="audience"
              value={formData.audience}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                errors.audience ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              {getAvailableAudiences().map(audience => (
                <option key={audience.value} value={audience.value}>
                  {audience.label}
                </option>
              ))}
            </select>
            {errors.audience && <p className="text-red-500 text-sm mt-1">{errors.audience}</p>}
          </div>

          {/* Department (conditional) */}
          {formData.audience === 'department_specific' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  errors.department ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
            </div>
          )}

          {/* Course (conditional) - allow multi-select for lecturers */}
          {formData.audience === 'course_specific' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course(s) *</label>
              {user.role === 'lecturer_admin' ? (
                <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded">
                  {lecturerCourses.map(c => (
                    <label key={c._id} className="flex items-center gap-2">
                      <input type="checkbox" value={c._id} checked={(formData.course || []).includes(String(c._id))} onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => {
                          const set = new Set(prev.course || []);
                          if (set.has(val)) set.delete(val); else set.add(val);
                          return { ...prev, course: Array.from(set) };
                        });
                      }} />
                      <span>{c.code} - {c.title}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <select name="course" value={formData.course} onChange={handleInputChange} className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${errors.course ? 'border-red-300' : 'border-gray-300'}`} required>
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>{course.code} - {course.title}</option>
                  ))}
                </select>
              )}
              {errors.course && <p className="text-red-500 text-sm mt-1">{errors.course}</p>}
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags (optional, comma separated)</label>
            <input name="tags" value={formData.tags || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="e.g., exams,assignment,holiday" />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date (Optional)
            </label>
            <input
              type="date"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments (Optional)
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <label
              htmlFor="file-upload"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <Upload className="w-4 h-4" />
              Upload Files
            </label>

            {/* Attachment List */}
            {formData.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{attachment.originalName}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (editingNews ? 'Update News' : 'Create News')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewsForm;