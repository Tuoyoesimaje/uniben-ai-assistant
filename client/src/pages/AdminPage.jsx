import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/shared/Navbar';
import { Users, Building, GraduationCap, BookOpen, FileText, BarChart3, Plus, Edit, Trash2 } from 'lucide-react';

const AdminPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (user?.role === 'staff') {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Loading admin dashboard data...');

      const [statsRes, usersRes, buildingsRes, departmentsRes, coursesRes, quizzesRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/admin/buildings', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/admin/departments', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/admin/courses', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/admin/quizzes', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]);

      console.log('API responses received:', {
        stats: statsRes.status,
        users: usersRes.status,
        buildings: buildingsRes.status,
        departments: departmentsRes.status,
        courses: coursesRes.status,
        quizzes: quizzesRes.status
      });

      const [statsData, usersData, buildingsData, departmentsData, coursesData, quizzesData] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
        buildingsRes.json(),
        departmentsRes.json(),
        coursesRes.json(),
        quizzesRes.json()
      ]);

      console.log('Parsed data:', {
        stats: statsData,
        users: usersData,
        buildings: buildingsData,
        departments: departmentsData,
        courses: coursesData,
        quizzes: quizzesData
      });

      if (statsData.success) setStats(statsData.stats);
      if (usersData.success) setUsers(usersData.users);
      if (buildingsData.success) setBuildings(buildingsData.buildings);
      if (departmentsData.success) setDepartments(departmentsData.departments);
      if (coursesData.success) setCourses(coursesData.courses);
      if (quizzesData.success) setQuizzes(quizzesData.quizzes);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      console.error('Error details:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      const response = await fetch(`/api/admin/${type}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        loadDashboardData();
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setFormData(item || {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setEditingItem(null);
    setFormData({});
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingItem
        ? `/api/admin/${modalType}s/${editingItem._id}`
        : `/api/admin/${modalType}s`;

      const method = editingItem ? 'PUT' : 'POST';

      console.log('Submitting form:', { url, method, formData });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      console.log('Response:', response.status, result);

      if (response.ok) {
        loadDashboardData();
        closeModal();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error(`Error ${editingItem ? 'updating' : 'creating'} ${modalType}:`, error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (user?.role !== 'staff') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <div className="login-card p-8 text-center">
          <h1 className="text-2xl font-bold text-[#111816] mb-4">Access Denied</h1>
          <p className="text-slate-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 to-teal-100">
      <Navbar />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                  activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                  activeTab === 'users' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Users className="w-5 h-5" />
                Users
              </button>
              <button
                onClick={() => setActiveTab('buildings')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                  activeTab === 'buildings' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Building className="w-5 h-5" />
                Buildings
              </button>
              <button
                onClick={() => setActiveTab('departments')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                  activeTab === 'departments' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <GraduationCap className="w-5 h-5" />
                Departments
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                  activeTab === 'courses' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                Courses
              </button>
              <button
                onClick={() => setActiveTab('quizzes')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                  activeTab === 'quizzes' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FileText className="w-5 h-5" />
                Quizzes
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="w-full">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                      <Users className="w-8 h-8 text-emerald-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.users || 0}</p>
                        <p className="text-sm text-gray-600">Users</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                      <Building className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.buildings || 0}</p>
                        <p className="text-sm text-gray-600">Buildings</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                      <GraduationCap className="w-8 h-8 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.departments || 0}</p>
                        <p className="text-sm text-gray-600">Departments</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                      <BookOpen className="w-8 h-8 text-orange-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.courses || 0}</p>
                        <p className="text-sm text-gray-600">Courses</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                      <FileText className="w-8 h-8 text-red-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.quizzes || 0}</p>
                        <p className="text-sm text-gray-600">Quizzes</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <p className="text-sm text-gray-700">System initialized successfully</p>
                      <span className="text-xs text-gray-500 ml-auto">Just now</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                  <button
                    onClick={() => openModal('user')}
                    className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 flex items-center gap-2 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Add User
                  </button>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user._id} className="border-b border-gray-100">
                            <td className="py-3 px-4">{user.name}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.role === 'staff' ? 'bg-purple-100 text-purple-800' :
                                user.role === 'student' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-sm">
                              {user.matricNumber || user.staffId || 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openModal('user', user)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete('users', user._id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Similar tables for buildings, departments, courses, quizzes */}
            {activeTab === 'buildings' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">Building Management</h2>
                  <button
                    onClick={() => openModal('building')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Add Building
                  </button>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Code</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Location</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {buildings.map((building) => (
                          <tr key={building._id} className="border-b border-gray-100">
                            <td className="py-3 px-4">{building.name}</td>
                            <td className="py-3 px-4 font-mono text-sm">{building.code}</td>
                            <td className="py-3 px-4">{building.department?.name || 'N/A'}</td>
                            <td className="py-3 px-4">
                              {building.location ? `${building.location.lat}, ${building.location.lng}` : 'N/A'}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openModal('building', building)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete('buildings', building._id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'departments' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">Department Management</h2>
                  <button
                    onClick={() => openModal('department')}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center gap-2 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Add Department
                  </button>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Code</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Head</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departments.map((department) => (
                          <tr key={department._id} className="border-b border-gray-100">
                            <td className="py-3 px-4">{department.name}</td>
                            <td className="py-3 px-4 font-mono text-sm">{department.code}</td>
                            <td className="py-3 px-4">{department.head || 'N/A'}</td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openModal('department', department)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete('departments', department._id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">Course Management</h2>
                  <button
                    onClick={() => openModal('course')}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center gap-2 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Add Course
                  </button>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Code</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Credits</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map((course) => (
                          <tr key={course._id} className="border-b border-gray-100">
                            <td className="py-3 px-4 font-mono text-sm">{course.code}</td>
                            <td className="py-3 px-4">{course.name}</td>
                            <td className="py-3 px-4">{course.department?.name || 'N/A'}</td>
                            <td className="py-3 px-4">{course.credits || 'N/A'}</td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openModal('course', course)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete('courses', course._id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'quizzes' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Quiz Management</h2>
                  <button
                    onClick={() => openModal('quiz')}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Quiz
                  </button>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Title</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Course</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Questions</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Created By</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quizzes.map((quiz) => (
                          <tr key={quiz._id} className="border-b border-gray-100">
                            <td className="py-3 px-4">{quiz.title}</td>
                            <td className="py-3 px-4">{quiz.course?.name || 'N/A'}</td>
                            <td className="py-3 px-4">{quiz.questions?.length || 0}</td>
                            <td className="py-3 px-4">{quiz.createdBy?.name || 'N/A'}</td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openModal('quiz', quiz)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete('quizzes', quiz._id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {editingItem ? 'Edit' : 'Add'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
              </h3>
              <form onSubmit={handleFormSubmit}>
                <div className="space-y-4">
                  {modalType === 'user' && (
                    <>
                      <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <select
                        name="role"
                        value={formData.role || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value="">Select Role</option>
                        <option value="student">Student</option>
                        <option value="staff">Staff</option>
                      </select>
                      {formData.role === 'student' && (
                        <input
                          type="text"
                          name="matricNumber"
                          placeholder="Matric Number"
                          value={formData.matricNumber || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded"
                        />
                      )}
                      {formData.role === 'staff' && (
                        <input
                          type="text"
                          name="staffId"
                          placeholder="Staff ID"
                          value={formData.staffId || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded"
                        />
                      )}
                    </>
                  )}

                  {modalType === 'building' && (
                    <>
                      <input
                        type="text"
                        name="name"
                        placeholder="Building Name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <input
                        type="text"
                        name="code"
                        placeholder="Building Code"
                        value={formData.code || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <select
                        name="department"
                        value={formData.department || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept._id} value={dept._id}>{dept.name}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        name="location"
                        placeholder="Location"
                        value={formData.location || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </>
                  )}

                  {modalType === 'department' && (
                    <>
                      <input
                        type="text"
                        name="name"
                        placeholder="Department Name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <input
                        type="text"
                        name="code"
                        placeholder="Department Code"
                        value={formData.code || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <input
                        type="text"
                        name="head"
                        placeholder="Department Head"
                        value={formData.head || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </>
                  )}

                  {modalType === 'course' && (
                    <>
                      <input
                        type="text"
                        name="code"
                        placeholder="Course Code"
                        value={formData.code || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <input
                        type="text"
                        name="name"
                        placeholder="Course Name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <select
                        name="department"
                        value={formData.department || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept._id} value={dept._id}>{dept.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        name="credits"
                        placeholder="Credits"
                        value={formData.credits || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </>
                  )}

                  {modalType === 'quiz' && (
                    <>
                      <input
                        type="text"
                        name="title"
                        placeholder="Quiz Title"
                        value={formData.title || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <select
                        name="course"
                        value={formData.course || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Select Course</option>
                        {courses.map(course => (
                          <option key={course._id} value={course._id}>{course.name}</option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                  >
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;