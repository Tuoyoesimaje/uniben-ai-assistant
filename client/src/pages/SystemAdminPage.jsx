import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import axios from 'axios';

const emptyForm = {
  name: '',
  email: '',
  role: 'staff',
  staffId: '',
  matricNumber: '',
  department: ''
};

const SystemAdminPage = () => {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users management
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState(emptyForm);
  const [departments, setDepartments] = useState([]);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: '' });
  
  // Courses management state
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({ code: '', title: '', department: '', credit: 3, level: 100, departments_offering: [] });
  
  // Buildings management state
  const [buildings, setBuildings] = useState([]);
  const [buildingsLoading, setBuildingsLoading] = useState(true);
  const [showBuildingModal, setShowBuildingModal] = useState(false);
  const [buildingForm, setBuildingForm] = useState({ name: '', location: '', department: '' });

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, usersRes, deptsRes, coursesRes, buildingsRes] = await Promise.all([
          axios.get('/api/admin/stats'),
          axios.get('/api/admin/users'),
          axios.get('/api/admin/departments'),
          axios.get('/api/admin/courses'),
          axios.get('/api/admin/buildings')
        ]);

        if (statsRes.data?.success) setStats(statsRes.data.stats);
        if (usersRes.data?.success) setUsers(usersRes.data.users || []);
        if (deptsRes.data?.success) setDepartments(deptsRes.data.departments || []);
        if (coursesRes.data?.success) setCourses(coursesRes.data.courses || []);
        if (buildingsRes.data?.success) setBuildings(buildingsRes.data.buildings || []);
      } catch (err) {
        console.error('Failed to fetch system data', err);
      } finally {
        setLoadingStats(false);
        setUsersLoading(false);
        setBuildingsLoading(false);
      }
    };

    fetchAll();
  }, []);

  const openCreateUser = () => {
    setUserForm(emptyForm);
    setShowUserModal(true);
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  const createUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = { ...userForm };
      const res = await axios.post('/api/admin/users', payload);
      if (res.data?.success) {
        setUsers(prev => [res.data.user, ...prev]);
        setShowUserModal(false);
        setUserForm(emptyForm);
      }
    } catch (err) {
      console.error('Create user failed', err);
      alert(err.response?.data?.message || 'Failed to create user');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      const res = await axios.delete(`/api/admin/users/${id}`);
      if (res.data?.success) {
        setUsers(prev => prev.filter(u => u._id !== id));
      }
    } catch (err) {
      console.error('Delete user failed', err);
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  // Buildings handlers
  const openCreateBuilding = () => {
    setBuildingForm({ name: '', location: '', department: '' });
    setShowBuildingModal(true);
  };

  const handleBuildingChange = (e) => {
    const { name, value } = e.target;
    setBuildingForm(prev => ({ ...prev, [name]: value }));
  };

  const saveBuilding = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (buildingForm._id) {
        const res = await axios.put(`/api/admin/buildings/${buildingForm._id}`, buildingForm);
        if (res.data?.success) {
          setBuildings(prev => prev.map(b => b._id === res.data.building._id ? res.data.building : b));
          setShowBuildingModal(false);
        }
      } else {
        const res = await axios.post('/api/admin/buildings', buildingForm);
        if (res.data?.success) {
          setBuildings(prev => [res.data.building, ...prev]);
          setShowBuildingModal(false);
        }
      }
    } catch (err) {
      console.error('Save building failed', err);
      alert(err.response?.data?.message || 'Failed to save building');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteBuilding = async (id) => {
    if (!confirm('Delete this building?')) return;
    try {
      const res = await axios.delete(`/api/admin/buildings/${id}`);
      if (res.data?.success) setBuildings(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      console.error('Delete building failed', err);
      alert(err.response?.data?.message || 'Failed to delete building');
    }
  };

  const openCreateCourse = () => {
    setCourseForm({ code: '', title: '', department: '', credit: 3, level: 100, departments_offering: [] });
    setShowCourseModal(true);
  };

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourseForm(prev => ({ ...prev, [name]: value }));
  };

  const saveCourse = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (courseForm._id) {
        const res = await axios.put(`/api/admin/courses/${courseForm._id}`, courseForm);
        if (res.data?.success) {
          setCourses(prev => prev.map(c => c._id === res.data.course._id ? res.data.course : c));
          setShowCourseModal(false);
        }
      } else {
        const res = await axios.post('/api/admin/courses', courseForm);
        if (res.data?.success) {
          setCourses(prev => [res.data.course, ...prev]);
          setShowCourseModal(false);
        }
      }
    } catch (err) {
      console.error('Save course failed', err);
      alert(err.response?.data?.message || 'Failed to save course');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteCourse = async (id) => {
    if (!confirm('Delete this course?')) return;
    try {
      const res = await axios.delete(`/api/admin/courses/${id}`);
      if (res.data?.success) setCourses(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      console.error('Delete course failed', err);
      alert(err.response?.data?.message || 'Failed to delete course');
    }
  };

  // local ui state for per-section navigation and pagination
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerms, setSearchTerms] = useState({ dashboard: '', users: '', courses: '', departments: '', buildings: '' });
  const [usersPage, setUsersPage] = useState(1);
  const [coursesPage, setCoursesPage] = useState(1);
  const [buildingsPage, setBuildingsPage] = useState(1);
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

  // Derived filtered + paginated data
  const filteredUsers = filterBySearch(users, searchTerms.users, ['name', 'email', 'role', 'department.name']);
  const pagedUsers = paginate(filteredUsers, usersPage);
  const filteredCourses = filterBySearch(courses, searchTerms.courses, ['code', 'title', 'department.name']);
  const pagedCourses = paginate(filteredCourses, coursesPage);
  const filteredBuildings = filterBySearch(buildings, searchTerms.buildings, ['name', 'location', 'department.name']);
  const pagedBuildings = paginate(filteredBuildings, buildingsPage);

  const currentPageKey = activeTab === 'users' ? 'users' : activeTab === 'courses' ? 'courses' : activeTab === 'buildings' ? 'buildings' : 'dashboard';
  const currentPageSetter = activeTab === 'users' ? setUsersPage : activeTab === 'courses' ? setCoursesPage : activeTab === 'buildings' ? setBuildingsPage : () => {};
  const currentPage = activeTab === 'users' ? usersPage : activeTab === 'courses' ? coursesPage : activeTab === 'buildings' ? buildingsPage : 1;
  const filteredData = activeTab === 'users' ? filteredUsers : activeTab === 'courses' ? filteredCourses : activeTab === 'buildings' ? filteredBuildings : [];
  const totalPages = Math.ceil(filteredData.length / pageSize);

  return (
    <AdminLayout title="System Administration">
      <div className="md:flex md:gap-6">
        {/* Sidebar Navigation */}
        <aside className="hidden md:block md:w-64">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 sticky top-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-sm">admin_panel_settings</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-800">System Admin</h3>
            </div>
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                  activeTab==='dashboard' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-sm">dashboard</span>
                <span className="text-sm font-medium">Overview</span>
              </button>
              <button 
                onClick={() => setActiveTab('buildings')} 
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                  activeTab==='buildings' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-sm">business</span>
                <span className="text-sm font-medium">Buildings</span>
              </button>
              <button 
                onClick={() => setActiveTab('departments')} 
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                  activeTab==='departments' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-sm">domain</span>
                <span className="text-sm font-medium">Departments</span>
              </button>
              <button 
                onClick={() => setActiveTab('courses')} 
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                  activeTab==='courses' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-sm">menu_book</span>
                <span className="text-sm font-medium">Courses</span>
              </button>
              <button 
                onClick={() => setActiveTab('users')} 
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                  activeTab==='users' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-sm">people</span>
                <span className="text-sm font-medium">Users</span>
              </button>
            </nav>
          </div>
        </aside>

        <div className="flex-1">
          {/* Mobile Navigation */}
          <div className="md:hidden mb-6">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {['dashboard', 'buildings', 'departments', 'courses', 'users'].map(tab => (
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
                <h1 className="text-2xl font-bold text-slate-800 mb-2">System Management</h1>
                <p className="text-slate-600">Manage users, courses, departments, and system resources</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {activeTab !== 'dashboard' && (
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">search</span>
                    <input
                      placeholder={`Search ${currentPageKey}...`}
                      className="w-full sm:w-64 pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      value={searchTerms[currentPageKey]}
                      onChange={(e) => setSearchTerms(prev => ({ ...prev, [currentPageKey]: e.target.value }))}
                    />
                  </div>
                )}
                {activeTab === 'users' && (
                  <button 
                    onClick={openCreateUser}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2.5 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <span className="material-symbols-outlined">add</span>
                    Create User
                  </button>
                )}
                {activeTab === 'buildings' && (
                  <button 
                    onClick={openCreateBuilding}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2.5 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <span className="material-symbols-outlined">add</span>
                    Add Building
                  </button>
                )}
                {activeTab === 'courses' && (
                  <button 
                    onClick={openCreateCourse}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2.5 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <span className="material-symbols-outlined">add</span>
                    Add Course
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            {activeTab === 'dashboard' && (
              <div className="p-6">
                {loadingStats ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-slate-600">Loading system overview...</span>
                    </div>
                  </div>
                ) : stats ? (
                  <>
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-slate-800 mb-2">System Overview</h2>
                      <p className="text-slate-600">Key metrics and system statistics</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">people</span>
                          </div>
                          <span className="text-xs font-medium opacity-80">Total Users</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">{stats.users ?? 0}</div>
                        <div className="text-xs opacity-80">System users</div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">business</span>
                          </div>
                          <span className="text-xs font-medium opacity-80">Buildings</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">{stats.buildings ?? 0}</div>
                        <div className="text-xs opacity-80">Campus buildings</div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">domain</span>
                          </div>
                          <span className="text-xs font-medium opacity-80">Departments</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">{stats.departments ?? 0}</div>
                        <div className="text-xs opacity-80">Academic departments</div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">menu_book</span>
                          </div>
                          <span className="text-xs font-medium opacity-80">Courses</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">{stats.courses ?? 0}</div>
                        <div className="text-xs opacity-80">Available courses</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-3xl text-slate-400">dashboard</span>
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-2">Unable to load statistics</h3>
                    <p className="text-slate-600">System overview will appear here once data is available</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-slate-800 mb-2">User Management</h2>
                  <p className="text-slate-600">Manage system users and their roles</p>
                </div>
                
                {usersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-slate-600">Loading users...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {filteredUsers.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="material-symbols-outlined text-3xl text-slate-400">people</span>
                        </div>
                        <h3 className="text-lg font-medium text-slate-800 mb-2">No users found</h3>
                        <p className="text-slate-600 mb-4">
                          {searchTerms.users ? 'Try adjusting your search terms' : 'Get started by creating your first user'}
                        </p>
                        {!searchTerms.users && (
                          <button 
                            onClick={openCreateUser}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200"
                          >
                            Create First User
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="text-left py-4 px-4 font-semibold text-slate-800">Name</th>
                              <th className="text-left py-4 px-4 font-semibold text-slate-800">Role</th>
                              <th className="text-left py-4 px-4 font-semibold text-slate-800">Department</th>
                              <th className="text-left py-4 px-4 font-semibold text-slate-800">Email</th>
                              <th className="text-left py-4 px-4 font-semibold text-slate-800">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pagedUsers.map(u => (
                              <tr key={u._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-200">
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                                      <span className="material-symbols-outlined text-white text-sm">person</span>
                                    </div>
                                    <span className="font-medium text-slate-800">{u.name}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 capitalize">
                                    {u.role.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-slate-700">{u.department?.name ?? '-'}</td>
                                <td className="py-4 px-4 text-slate-700">{u.email ?? '-'}</td>
                                <td className="py-4 px-4">
                                  <button 
                                    onClick={() => deleteUser(u._id)} 
                                    className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {totalPages > 1 && (
                      <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-slate-600">
                          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} users
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => currentPageSetter(Math.max(1, currentPage-1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            Previous
                          </button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => currentPageSetter(pageNum)}
                                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    currentPage === pageNum
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
                            onClick={() => currentPageSetter(Math.min(totalPages, currentPage+1))}
                            disabled={currentPage === totalPages}
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

            {activeTab === 'buildings' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-slate-800 mb-2">Building Management</h2>
                  <p className="text-slate-600">Manage campus buildings and facilities</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-4 px-4 font-semibold text-slate-800">Name</th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-800">Location</th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-800">Department</th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-800">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedBuildings.map(b => (
                        <tr key={b._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-200">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-sm">business</span>
                              </div>
                              <span className="font-medium text-slate-800">{b.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-slate-700">{b.location ?? '-'}</td>
                          <td className="py-4 px-4 text-slate-700">{b.department?.name ?? '-'}</td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => { setBuildingForm(b); setShowBuildingModal(true); }} 
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-sm">edit</span>
                                Edit
                              </button>
                              <button 
                                onClick={() => deleteBuilding(b._id)} 
                                className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'departments' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-slate-800 mb-2">Department Management</h2>
                  <p className="text-slate-600">Manage academic departments</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-4 px-4 font-semibold text-slate-800">Name</th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-800">Code</th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-800">Head</th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-800">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments.map(d => (
                        <tr key={d._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-200">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-sm">domain</span>
                              </div>
                              <span className="font-medium text-slate-800">{d.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-slate-700">{d.code ?? '-'}</td>
                          <td className="py-4 px-4 text-slate-700">{d.departmentalAdmin?.name ?? '-'}</td>
                          <td className="py-4 px-4">
                            <button 
                              onClick={() => { setDeptForm(d); setShowDeptModal(true); }} 
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-sm">edit</span>
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-slate-800 mb-2">Course Management</h2>
                  <p className="text-slate-600">Manage course catalog and offerings</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-4 px-4 font-semibold text-slate-800">Code</th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-800">Title</th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-800">Department</th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-800">Level</th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-800">Credit</th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-800">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedCourses.map(c => (
                        <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-200">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-sm">menu_book</span>
                              </div>
                              <span className="font-medium text-slate-800">{c.code}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-slate-700">{c.title}</td>
                          <td className="py-4 px-4 text-slate-700">{c.department?.name ?? '-'}</td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              Level {c.level}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-slate-700">{c.credit}</td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => { setCourseForm(c); setShowCourseModal(true); }} 
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-sm">person_add</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">Create User</h3>
                </div>
                <button 
                  onClick={() => setShowUserModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            
            <form onSubmit={createUser} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                  <input 
                    name="name" 
                    value={userForm.name} 
                    onChange={handleUserChange} 
                    placeholder="Enter full name" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input 
                    name="email" 
                    type="email" 
                    value={userForm.email} 
                    onChange={handleUserChange} 
                    placeholder="Enter email address" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Role *</label>
                  <select 
                    name="role" 
                    value={userForm.role} 
                    onChange={handleUserChange} 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  >
                    <option value="system_admin">System Admin</option>
                    <option value="departmental_admin">Departmental Admin</option>
                    <option value="lecturer_admin">Lecturer Admin</option>
                    <option value="bursary_admin">Bursary Admin</option>
                    <option value="staff">Staff</option>
                    <option value="student">Student</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Staff ID</label>
                  <input 
                    name="staffId" 
                    value={userForm.staffId} 
                    onChange={handleUserChange} 
                    placeholder="Enter staff ID" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Matric Number</label>
                  <input 
                    name="matricNumber" 
                    value={userForm.matricNumber} 
                    onChange={handleUserChange} 
                    placeholder="Enter matric number" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                  <select 
                    name="department" 
                    value={userForm.department} 
                    onChange={handleUserChange} 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map(d => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowUserModal(false)} 
                  className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2.5 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={actionLoading || !userForm.name.trim()}
                >
                  {actionLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">person_add</span>
                      Create User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Building Modal */}
      {showBuildingModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-sm">business</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">
                    {buildingForm._id ? 'Edit Building' : 'Create Building'}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowBuildingModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            
            <form onSubmit={saveBuilding} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Building Name *</label>
                  <input 
                    name="name" 
                    value={buildingForm.name} 
                    onChange={handleBuildingChange} 
                    placeholder="Enter building name" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                  <input 
                    name="location" 
                    value={buildingForm.location} 
                    onChange={handleBuildingChange} 
                    placeholder="Enter location/address" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                  <select 
                    name="department" 
                    value={buildingForm.department} 
                    onChange={handleBuildingChange} 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  >
                    <option value="">-- Assign Department (optional) --</option>
                    {departments.map(d => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowBuildingModal(false)} 
                  className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2.5 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={actionLoading || !buildingForm.name.trim()}
                >
                  {actionLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">save</span>
                      Save Building
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-sm">menu_book</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">
                    {courseForm._id ? 'Edit Course' : 'Create Course'}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowCourseModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            
            <form onSubmit={saveCourse} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Course Code *</label>
                  <input 
                    name="code" 
                    value={courseForm.code} 
                    onChange={handleCourseChange} 
                    placeholder="e.g., CSC101" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Course Title *</label>
                  <input 
                    name="title" 
                    value={courseForm.title} 
                    onChange={handleCourseChange} 
                    placeholder="Enter course title" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Department *</label>
                  <select 
                    name="department" 
                    value={courseForm.department} 
                    onChange={handleCourseChange} 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    required
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map(d => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Level</label>
                  <input 
                    name="level" 
                    type="number" 
                    value={courseForm.level} 
                    onChange={handleCourseChange} 
                    placeholder="100" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Credit Hours</label>
                  <input 
                    name="credit" 
                    type="number" 
                    value={courseForm.credit} 
                    onChange={handleCourseChange} 
                    placeholder="3" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                  />
                </div>
              </div>

              {/* Department Offerings Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-slate-800">Department Offerings</h4>
                  <button 
                    type="button" 
                    onClick={() => {
                      setCourseForm(prev => ({ 
                        ...prev, 
                        departments_offering: [...(prev.departments_offering || []), { department: '', level: 100, semester: 'both', lecturerId: '' }] 
                      }));
                    }} 
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Add Offering
                  </button>
                </div>
                
                <div className="space-y-4">
                  {(courseForm.departments_offering || []).map((offering, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                          <select 
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                            value={offering.department || ''} 
                            onChange={(e) => {
                              const val = e.target.value;
                              setCourseForm(prev => {
                                const arr = [...(prev.departments_offering || [])];
                                arr[idx] = { ...(arr[idx] || {}), department: val };
                                return { ...prev, departments_offering: arr };
                              });
                            }}
                          >
                            <option value="">-- Select Dept --</option>
                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                          <input 
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                            type="number" 
                            value={offering.level || 100} 
                            onChange={(e) => {
                              const v = Number(e.target.value || 100);
                              setCourseForm(prev => {
                                const arr = [...(prev.departments_offering || [])];
                                arr[idx] = { ...(arr[idx] || {}), level: v };
                                return { ...prev, departments_offering: arr };
                              });
                            }} 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                          <select 
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                            value={offering.semester || 'both'} 
                            onChange={(e) => {
                              const v = e.target.value;
                              setCourseForm(prev => {
                                const arr = [...(prev.departments_offering || [])];
                                arr[idx] = { ...(arr[idx] || {}), semester: v };
                                return { ...prev, departments_offering: arr };
                              });
                            }}
                          >
                            <option value="both">Both</option>
                            <option value="first">First</option>
                            <option value="second">Second</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Lecturer ID</label>
                          <input 
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                            placeholder="Lecturer ID" 
                            value={offering.lecturerId || ''} 
                            onChange={(e) => {
                              const v = e.target.value;
                              setCourseForm(prev => {
                                const arr = [...(prev.departments_offering || [])];
                                arr[idx] = { ...(arr[idx] || {}), lecturerId: v };
                                return { ...prev, departments_offering: arr };
                              });
                            }} 
                          />
                        </div>
                      </div>
                      <div className="mt-3 text-right">
                        <button 
                          type="button" 
                          onClick={() => {
                            setCourseForm(prev => ({ 
                              ...prev, 
                              departments_offering: (prev.departments_offering || []).filter((_, i) => i !== idx) 
                            }));
                          }} 
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ml-auto"
                        >
                          <span className="material-symbols-outlined text-sm">remove</span>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowCourseModal(false)} 
                  className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2.5 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={actionLoading || !courseForm.code.trim() || !courseForm.title.trim() || !courseForm.department}
                >
                  {actionLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">save</span>
                      Save Course
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-sm">domain</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">
                    {deptForm._id ? 'Edit Department' : 'Create Department'}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowDeptModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                if (deptForm._id) {
                  const res = await axios.put(`/api/admin/departments/${deptForm._id}`, { name: deptForm.name, code: deptForm.code });
                  if (res.data?.success) {
                    setDepartments(prev => prev.map(d => d._id === res.data.department._id ? res.data.department : d));
                    setShowDeptModal(false);
                  }
                } else {
                  const res = await axios.post('/api/admin/departments', { name: deptForm.name, code: deptForm.code });
                  if (res.data?.success) {
                    setDepartments(prev => [res.data.department, ...prev]);
                    setShowDeptModal(false);
                  }
                }
              } catch (err) {
                console.error('Save department failed', err);
                alert(err.response?.data?.message || 'Failed to save department');
              }
            }} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Department Name *</label>
                  <input 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                    name="name" 
                    value={deptForm.name} 
                    onChange={(e) => setDeptForm(prev => ({ ...prev, name: e.target.value }))} 
                    placeholder="Enter department name" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Department Code</label>
                  <input 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                    name="code" 
                    value={deptForm.code} 
                    onChange={(e) => setDeptForm(prev => ({ ...prev, code: e.target.value }))} 
                    placeholder="e.g., CSC" 
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowDeptModal(false)} 
                  className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2.5 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center gap-2"
                  disabled={!deptForm.name.trim()}
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default SystemAdminPage;
