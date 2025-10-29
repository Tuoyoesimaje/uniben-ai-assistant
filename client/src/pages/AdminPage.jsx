import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/shared/Navbar';
import { Users, Building, GraduationCap, BookOpen, FileText, BarChart3, Plus, Edit, Trash2, Newspaper, DollarSign } from 'lucide-react';
import NewsManagementTab from '../components/news/NewsManagementTab';

const AdminPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [news, setNews] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchTerms, setSearchTerms] = useState({
    users: '',
    departments: '',
    courses: '',
    buildings: '',
    quizzes: '',
    news: ''
  });

  useEffect(() => {
    if (user && ['system_admin', 'bursary_admin', 'departmental_admin', 'lecturer_admin', 'staff'].includes(user.role)) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Loading admin dashboard data...');

      const requests = [
        fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ];

      // Add role-specific data requests. Keep a stable order so responses map correctly
      // Order expectation for system_admin: stats, users, buildings, departments, courses, quizzes, news
      if (['system_admin', 'bursary_admin', 'departmental_admin', 'lecturer_admin', 'staff'].includes(user.role)) {
        // System admin gets users first so the response ordering matches the processing below
        if (user.role === 'system_admin') {
          requests.push(fetch('/api/admin/users', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }));
        }

        // All admin types can see buildings (push after users for consistent ordering)
        requests.push(fetch('/api/admin/buildings', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }));

        // System admin additional endpoints
        if (user.role === 'system_admin') {
          requests.push(fetch('/api/admin/departments', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }));
          requests.push(fetch('/api/admin/courses', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }));
          requests.push(fetch('/api/admin/quizzes', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }));
          requests.push(fetch('/api/news/admin/all', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }));
        }

        // Bursary admin gets fees data
        else if (user.role === 'bursary_admin') {
          requests.push(fetch('/api/fees/stats/summary', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }));
          requests.push(fetch('/api/news/admin/all', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }));
        }

        // Departmental admin gets department-specific data
        else if (user.role === 'departmental_admin') {
          requests.push(fetch('/api/admin/courses', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }));
          requests.push(fetch('/api/news/admin/all', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }));
        }

        // Lecturer admin gets their courses and news
        else if (user.role === 'lecturer_admin') {
          requests.push(fetch('/api/admin/courses', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }));
          requests.push(fetch('/api/admin/quizzes', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }));
          requests.push(fetch('/api/news/admin/all', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }));
        }

        // Staff gets basic data
        else if (user.role === 'staff') {
          requests.push(fetch('/api/admin/courses', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }));
          requests.push(fetch('/api/admin/quizzes', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }));
          requests.push(fetch('/api/news/admin/all', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }));
        }
      }

      const responses = await Promise.all(requests);

      console.log('API responses received:', responses.map((res, index) => ({
        request: index,
        status: res.status
      })));

      const dataPromises = responses.map(res => res.json());
      const data = await Promise.all(dataPromises);

      console.log('Parsed data:', data);

      // Process responses based on the requests made
      let dataIndex = 0;
      const statsData = data[dataIndex++];
      if (statsData.success) setStats(statsData.stats);

      if (['system_admin', 'bursary_admin', 'departmental_admin', 'lecturer_admin', 'staff'].includes(user.role)) {
        // Process responses based on user role
        if (user.role === 'system_admin') {
          // System admin: stats, users, buildings, departments, courses, quizzes, news
          const usersData = data[dataIndex++];
          if (usersData && usersData.success) setUsers(usersData.users || []);

          const buildingsData = data[dataIndex++];
          if (buildingsData && buildingsData.success) setBuildings(buildingsData.buildings || []);

          const departmentsData = data[dataIndex++];
          if (departmentsData && departmentsData.success) setDepartments(departmentsData.departments || []);

          const coursesData = data[dataIndex++];
          if (coursesData && coursesData.success) setCourses(coursesData.courses || []);

          const quizzesData = data[dataIndex++];
          if (quizzesData && quizzesData.success) setQuizzes(quizzesData.quizzes || []);

          const newsData = data[dataIndex++];
          if (newsData && newsData.success) setNews(newsData.news || []);
        }

        else if (user.role === 'bursary_admin') {
          // Bursary admin: stats, buildings, fees stats, news
          const buildingsData = data[dataIndex++];
          if (buildingsData && buildingsData.success) setBuildings(buildingsData.buildings || []);

          const feesStatsData = data[dataIndex++];
          if (feesStatsData && feesStatsData.success) setFees(feesStatsData);

          const newsData = data[dataIndex++];
          if (newsData && newsData.success) setNews(newsData.news || []);
        }

        else if (user.role === 'departmental_admin') {
          // Departmental admin: stats, buildings, courses, news
          const buildingsData = data[dataIndex++];
          if (buildingsData && buildingsData.success) setBuildings(buildingsData.buildings || []);

          const coursesData = data[dataIndex++];
          if (coursesData && coursesData.success) setCourses(coursesData.courses || []);

          const newsData = data[dataIndex++];
          if (newsData && newsData.success) setNews(newsData.news || []);
        }

        else if (user.role === 'lecturer_admin') {
          // Lecturer admin: stats, buildings, courses, quizzes, news
          const buildingsData = data[dataIndex++];
          if (buildingsData && buildingsData.success) setBuildings(buildingsData.buildings || []);

          const coursesData = data[dataIndex++];
          if (coursesData && coursesData.success) setCourses(coursesData.courses || []);

          const quizzesData = data[dataIndex++];
          if (quizzesData && quizzesData.success) setQuizzes(quizzesData.quizzes || []);

          const newsData = data[dataIndex++];
          if (newsData && newsData.success) setNews(newsData.news || []);
        }

        else if (user.role === 'staff') {
          // Staff: stats, buildings, courses, quizzes, news
          const buildingsData = data[dataIndex++];
          if (buildingsData && buildingsData.success) setBuildings(buildingsData.buildings || []);

          const coursesData = data[dataIndex++];
          if (coursesData && coursesData.success) setCourses(coursesData.courses || []);

          const quizzesData = data[dataIndex++];
          if (quizzesData && quizzesData.success) setQuizzes(quizzesData.quizzes || []);

          const newsData = data[dataIndex++];
          if (newsData && newsData.success) setNews(newsData.news || []);
        }
      }
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

  const handleSearchChange = (table, value) => {
    setSearchTerms(prev => ({ ...prev, [table]: value }));
  };

  const filterData = (data, searchTerm, fields) => {
    if (!searchTerm || !data || !Array.isArray(data)) return data || [];
    return data.filter(item =>
      fields.some(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], item);
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  };

  const allowedRoles = ['system_admin', 'bursary_admin', 'departmental_admin', 'lecturer_admin', 'staff'];
  if (!user || !allowedRoles.includes(user.role)) {
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

              {/* System Admin Only */}
              {user.role === 'system_admin' && (
                <>
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
                    onClick={() => setActiveTab('departments')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                      activeTab === 'departments' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <GraduationCap className="w-5 h-5" />
                    Departments
                  </button>
                </>
              )}

              {/* Bursary Admin */}
              {user.role === 'bursary_admin' && (
                <button
                  onClick={() => setActiveTab('fees')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                    activeTab === 'fees' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <DollarSign className="w-5 h-5" />
                  Fees & Payments
                </button>
              )}

              {/* Departmental Admin */}
              {user.role === 'departmental_admin' && (
                <>
                  <button
                    onClick={() => setActiveTab('courses')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                      activeTab === 'courses' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <BookOpen className="w-5 h-5" />
                    Department Courses
                  </button>
                  <button
                    onClick={() => setActiveTab('news')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                      activeTab === 'news' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Newspaper className="w-5 h-5" />
                    Department News
                  </button>
                </>
              )}

              {/* Lecturer Admin */}
              {user.role === 'lecturer_admin' && (
                <>
                  <button
                    onClick={() => setActiveTab('courses')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                      activeTab === 'courses' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <BookOpen className="w-5 h-5" />
                    My Courses
                  </button>
                  <button
                    onClick={() => setActiveTab('news')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                      activeTab === 'news' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Newspaper className="w-5 h-5" />
                    Course News
                  </button>
                </>
              )}

              {/* News Management for admins who can post news */}
              {['system_admin', 'bursary_admin', 'departmental_admin', 'lecturer_admin'].includes(user.role) && (
                <button
                  onClick={() => setActiveTab('news-management')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                    activeTab === 'news-management' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Newspaper className="w-5 h-5" />
                  Manage News
                </button>
              )}

              {/* Common for all admin types */}
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

            {activeTab === 'users' && user.role === 'system_admin' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerms.users}
                      onChange={(e) => handleSearchChange('users', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => openModal('user')}
                      className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 flex items-center gap-2 w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Add User
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterData(users, searchTerms.users, ['name', 'role', 'matricNumber', 'staffId', 'department.name']).map((user) => (
                          <tr key={user._id} className="border-b border-gray-100">
                            <td className="py-3 px-4">{user.name}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.role === 'system_admin' ? 'bg-red-100 text-red-800' :
                                user.role === 'bursary_admin' ? 'bg-green-100 text-green-800' :
                                user.role === 'departmental_admin' ? 'bg-blue-100 text-blue-800' :
                                user.role === 'lecturer_admin' ? 'bg-purple-100 text-purple-800' :
                                user.role === 'staff' ? 'bg-yellow-100 text-yellow-800' :
                                user.role === 'student' ? 'bg-indigo-100 text-indigo-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-sm">
                              {user.matricNumber || user.staffId || 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {user.department?.name || 'N/A'}
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
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search buildings..."
                      value={searchTerms.buildings}
                      onChange={(e) => handleSearchChange('buildings', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => openModal('building')}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2 w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Add Building
                    </button>
                  </div>
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
                        {filterData(buildings, searchTerms.buildings, ['name', 'department.name', 'description']).map((building) => (
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

            {activeTab === 'departments' && user.role === 'system_admin' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">Department Management</h2>
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search departments..."
                      value={searchTerms.departments}
                      onChange={(e) => handleSearchChange('departments', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => openModal('department')}
                      className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center gap-2 w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Add Department
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Faculty</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">HOD</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Admin</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterData(departments, searchTerms.departments, ['name', 'faculty', 'hodName', 'departmentalAdmin.name']).map((department) => (
                          <tr key={department._id} className="border-b border-gray-100">
                            <td className="py-3 px-4">{department.name}</td>
                            <td className="py-3 px-4">{department.faculty}</td>
                            <td className="py-3 px-4">{department.hodName || 'N/A'}</td>
                            <td className="py-3 px-4">{department.departmentalAdmin?.name || 'Not Assigned'}</td>
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

            {activeTab === 'news' && ['system_admin', 'bursary_admin', 'departmental_admin', 'lecturer_admin'].includes(user.role) && (
              <NewsManagementTab user={user} />
            )}

            {activeTab === 'news-management' && ['system_admin', 'bursary_admin', 'departmental_admin', 'lecturer_admin'].includes(user.role) && (
              <NewsManagementTab user={user} />
            )}

            {activeTab === 'courses' && (user.role === 'system_admin' || user.role === 'departmental_admin' || user.role === 'lecturer_admin') && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user.role === 'lecturer_admin' ? 'My Assigned Courses' : user.role === 'departmental_admin' ? 'Department Courses' : 'Course Management'}
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={searchTerms.courses}
                      onChange={(e) => handleSearchChange('courses', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    {(user.role === 'system_admin' || user.role === 'departmental_admin') && (
                      <button
                        onClick={() => openModal('course')}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center gap-2 w-full sm:w-auto"
                      >
                        <Plus className="w-4 h-4" />
                        Add Course
                      </button>
                    )}
                    {user.role === 'lecturer_admin' && (
                      <button
                        onClick={() => openModal('course')}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center gap-2 w-full sm:w-auto"
                      >
                        <Plus className="w-4 h-4" />
                        Create Course
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Code</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Title</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Lecturer</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Level</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Students</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterData(courses, searchTerms.courses, ['code', 'title', 'department.name', 'lecturerId.name', 'lecturer.name']).map((course) => (
                          <tr key={course._id} className="border-b border-gray-100">
                            <td className="py-3 px-4 font-mono text-sm">{course.code}</td>
                            <td className="py-3 px-4">{course.title}</td>
                            <td className="py-3 px-4">{course.department?.name || 'N/A'}</td>
                            <td className="py-3 px-4">{course.lecturerId?.name || course.lecturer?.name || 'Not Assigned'}</td>
                            <td className="py-3 px-4">{course.level}</td>
                            <td className="py-3 px-4">{course.students?.length || 0}</td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openModal('course', course)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                {(user.role === 'system_admin' || user.role === 'departmental_admin') && (
                                  <button
                                    onClick={() => handleDelete('courses', course._id)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
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
                <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">Quiz Management</h2>
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search quizzes..."
                      value={searchTerms.quizzes}
                      onChange={(e) => handleSearchChange('quizzes', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => openModal('quiz')}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2 w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Add Quiz
                    </button>
                  </div>
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
                        {filterData(quizzes, searchTerms.quizzes, ['title', 'course.title', 'course.name', 'createdBy.name']).map((quiz) => (
                          <tr key={quiz._id} className="border-b border-gray-100">
                            <td className="py-3 px-4">{quiz.title}</td>
                            <td className="py-3 px-4">{quiz.course?.title || quiz.course?.name || 'N/A'}</td>
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
                  {modalType === 'user' && user.role === 'system_admin' && (
                    <>
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
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
                        <option value="system_admin">System Admin</option>
                        <option value="bursary_admin">Bursary Admin</option>
                        <option value="departmental_admin">Departmental Admin</option>
                        <option value="lecturer_admin">Lecturer Admin</option>
                        <option value="staff">Staff</option>
                        <option value="student">Student</option>
                      </select>
                      {(formData.role === 'student' || formData.role === 'staff' || ['system_admin', 'bursary_admin', 'departmental_admin', 'lecturer_admin'].includes(formData.role)) && (
                        <>
                          {formData.role === 'student' && (
                            <input
                              type="text"
                              name="matricNumber"
                              placeholder="Matric Number (e.g., CSC/18/1234)"
                              value={formData.matricNumber || ''}
                              onChange={handleInputChange}
                              className="w-full p-2 border rounded"
                              required
                            />
                          )}
                          {(formData.role === 'staff' || ['system_admin', 'bursary_admin', 'departmental_admin', 'lecturer_admin'].includes(formData.role)) && (
                            <input
                              type="text"
                              name="staffId"
                              placeholder="Staff ID (e.g., STAFF-1234)"
                              value={formData.staffId || ''}
                              onChange={handleInputChange}
                              className="w-full p-2 border rounded"
                              required
                            />
                          )}
                          <select
                            name="department"
                            value={formData.department || ''}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                          >
                            <option value="">Select Department (Optional)</option>
                            {departments.map(dept => (
                              <option key={dept._id} value={dept._id}>{dept.name}</option>
                            ))}
                          </select>
                        </>
                      )}
                      <input
                        type="email"
                        name="email"
                        placeholder="Email (Optional)"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
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
                        {departments && departments.map && departments.map(dept => (
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

                  {modalType === 'department' && user.role === 'system_admin' && (
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
                        name="faculty"
                        placeholder="Faculty"
                        value={formData.faculty || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <input
                        type="text"
                        name="hodName"
                        placeholder="Head of Department Name"
                        value={formData.hodName || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <input
                        type="email"
                        name="hodEmail"
                        placeholder="HOD Email"
                        value={formData.hodEmail || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                      <input
                        type="text"
                        name="location"
                        placeholder="Office Location"
                        value={formData.location || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                      <select
                        name="departmentalAdmin"
                        value={formData.departmentalAdmin || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Select Departmental Admin (Optional)</option>
                        {users && users.filter && users.filter(u => u.role === 'departmental_admin').map(admin => (
                          <option key={admin._id} value={admin._id}>{admin.name}</option>
                        ))}
                      </select>
                    </>
                  )}

                  {modalType === 'course' && (user.role === 'system_admin' || user.role === 'departmental_admin' || user.role === 'lecturer_admin') && (
                    <>
                      <input
                        type="text"
                        name="code"
                        placeholder="Course Code (e.g., CSC 201)"
                        value={formData.code || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <input
                        type="text"
                        name="title"
                        placeholder="Course Title"
                        value={formData.title || ''}
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
                        disabled={user.role === 'departmental_admin'} // Departmental admin can't change department
                      >
                        <option value="">Select Department</option>
                        {departments && departments.map && departments.map(dept => {
                          // Departmental admin can only select their own department
                          if (user.role === 'departmental_admin' && user.department && dept._id !== user.department) {
                            return null;
                          }
                          return <option key={dept._id} value={dept._id}>{dept.name}</option>;
                        })}
                      </select>
                      <input
                        type="number"
                        name="level"
                        placeholder="Level (100-800)"
                        value={formData.level || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        min="100"
                        max="800"
                        required
                      />
                      <input
                        type="number"
                        name="credit"
                        placeholder="Credit Hours"
                        value={formData.credit || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        min="1"
                        max="6"
                        required
                      />
                      {/* Lecturer assignment based on role */}
                      {(user.role === 'system_admin' || user.role === 'departmental_admin') && (
                        <select
                          name="lecturerId"
                          value={formData.lecturerId || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded"
                        >
                          <option value="">Select Lecturer (Optional)</option>
                          {users && users.filter && users.filter(u => u.role === 'lecturer_admin').map(lecturer => (
                            <option key={lecturer._id} value={lecturer._id}>{lecturer.name} ({lecturer.staffId})</option>
                          ))}
                        </select>
                      )}
                      {user.role === 'lecturer_admin' && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <strong>Note:</strong> You can only create courses that will be assigned to you as the lecturer.
                        </div>
                      )}
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
                        {courses && courses.map && courses.map(course => (
                          <option key={course._id} value={course._id}>{course.title || course.name}</option>
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