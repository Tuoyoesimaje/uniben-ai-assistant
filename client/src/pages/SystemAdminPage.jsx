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

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, usersRes, deptsRes, coursesRes, buildingsRes] = await Promise.all([
          axios.get('/api/admin/stats'),
          axios.get('/api/admin/users'),
          axios.get('/api/admin/departments'),
          axios.get('/api/admin/courses')
          , axios.get('/api/admin/buildings')
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

  // Buildings handlers
  const openCreateBuilding = () => {
    setBuildingForm({ name: '', location: '', department: '' });
    setShowBuildingModal(true);
  };

  const closeBuildingModal = () => setShowBuildingModal(false);

  const handleBuildingChange = (e) => {
    const { name, value } = e.target;
    setBuildingForm(prev => ({ ...prev, [name]: value }));
  };

  const saveBuilding = async (e) => {
    e.preventDefault();
    try {
      if (buildingForm._id) {
        const res = await axios.put(`/api/admin/buildings/${buildingForm._id}`, buildingForm);
        if (res.data?.success) {
          setBuildings(prev => prev.map(b => b._id === res.data.building._id ? res.data.building : b));
          closeBuildingModal();
        }
      } else {
        const res = await axios.post('/api/admin/buildings', buildingForm);
        if (res.data?.success) {
          setBuildings(prev => [res.data.building, ...prev]);
          closeBuildingModal();
        }
      }
    } catch (err) {
      console.error('Save building failed', err);
      alert(err.response?.data?.message || 'Failed to save building');
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

  const closeUserModal = () => setShowUserModal(false);

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  const openCreateCourse = () => {
    setCourseForm({ code: '', title: '', department: '', credit: 3, level: 100, departments_offering: [] });
    setShowCourseModal(true);
  };

  const closeCourseModal = () => setShowCourseModal(false);

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourseForm(prev => ({ ...prev, [name]: value }));
  };

  const saveCourse = async (e) => {
    e.preventDefault();
    try {
      if (courseForm._id) {
        const res = await axios.put(`/api/admin/courses/${courseForm._id}`, courseForm);
        if (res.data?.success) {
          setCourses(prev => prev.map(c => c._id === res.data.course._id ? res.data.course : c));
          closeCourseModal();
        }
      } else {
        const res = await axios.post('/api/admin/courses', courseForm);
        if (res.data?.success) {
          setCourses(prev => [res.data.course, ...prev]);
          closeCourseModal();
        }
      }
    } catch (err) {
      console.error('Save course failed', err);
      alert(err.response?.data?.message || 'Failed to save course');
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

  const createUser = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...userForm };
      const res = await axios.post('/api/admin/users', payload);
      if (res.data?.success) {
        setUsers(prev => [res.data.user, ...prev]);
        closeUserModal();
      }
    } catch (err) {
      console.error('Create user failed', err);
      alert(err.response?.data?.message || 'Failed to create user');
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

  // Local DepartmentsList component (kept inside the page for now)
  const DepartmentsList = ({ departments, onDelete, onEdit }) => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Head</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(d => (
              <tr key={d._id} className="border-t">
                <td className="px-3 py-2">{d.name}</td>
                <td className="px-3 py-2">{d.code ?? '-'}</td>
                <td className="px-3 py-2">{d.departmentalAdmin?.name ?? '-'}</td>
                <td className="px-3 py-2">
                  <button onClick={() => onEdit(d)} className="mr-3 text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => onDelete(d._id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Local CoursesList component
  const CoursesList = ({ courses, onDelete, onEdit }) => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Dept</th>
              <th className="px-3 py-2">Level</th>
              <th className="px-3 py-2">Credit</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(c => (
              <tr key={c._id} className="border-t">
                <td className="px-3 py-2">{c.code}</td>
                <td className="px-3 py-2">{c.title}</td>
                <td className="px-3 py-2">{c.department?.name ?? '-'}</td>
                <td className="px-3 py-2">{c.level}</td>
                <td className="px-3 py-2">{c.credit}</td>
                <td className="px-3 py-2">
                  <button onClick={() => onEdit(c)} className="mr-3 text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => onDelete(c._id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Local BuildingsList component
  const BuildingsList = ({ buildings, onDelete, onEdit }) => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Location</th>
              <th className="px-3 py-2">Department</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {buildings.map(b => (
              <tr key={b._id} className="border-t">
                <td className="px-3 py-2">{b.name}</td>
                <td className="px-3 py-2">{b.location ?? '-'}</td>
                <td className="px-3 py-2">{b.department?.name ?? '-'}</td>
                <td className="px-3 py-2">
                  <button onClick={() => onEdit(b)} className="mr-3 text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => onDelete(b._id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <AdminLayout title="System Administration">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-2">Users</h3>
          <p className="text-sm text-slate-600">Manage system users and roles.</p>
          <div className="mt-3">
            <button onClick={openCreateUser} className="btn-primary">Create User</button>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-2">Departments</h3>
          <p className="text-sm text-slate-600">Create and manage departments and departmental admins.</p>
          <div className="mt-3">
            <button className="btn-primary">Open Departments</button>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-2">Courses</h3>
          <p className="text-sm text-slate-600">Create global course templates and assign owning departments.</p>
          <div className="mt-3">
            <button className="btn-primary">Open Courses</button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg p-4 border shadow-sm">
        <h2 className="font-semibold mb-2">System stats</h2>
        {loadingStats ? (
          <p className="text-slate-600">Loading...</p>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 border rounded text-center">
              <div className="text-2xl font-bold">{stats.users ?? '-'}</div>
              <div className="text-sm text-slate-600">Users</div>
            </div>
            <div className="p-3 border rounded text-center">
              <div className="text-2xl font-bold">{stats.buildings ?? '-'}</div>
              <div className="text-sm text-slate-600">Buildings</div>
            </div>
            <div className="p-3 border rounded text-center">
              <div className="text-2xl font-bold">{stats.departments ?? '-'}</div>
              <div className="text-sm text-slate-600">Departments</div>
            </div>
            <div className="p-3 border rounded text-center">
              <div className="text-2xl font-bold">{stats.courses ?? '-'}</div>
              <div className="text-sm text-slate-600">Courses</div>
            </div>
          </div>
        ) : (
          <p className="text-slate-600">Unable to load statistics.</p>
        )}
      </div>

      <div className="mt-6 bg-white rounded-lg p-4 border shadow-sm">
        <h2 className="font-semibold mb-4">Users</h2>
        {usersLoading ? (
          <p className="text-slate-600">Loading users...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Department</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-t">
                    <td className="px-3 py-2">{u.name}</td>
                    <td className="px-3 py-2">{u.role}</td>
                    <td className="px-3 py-2">{u.department?.name ?? '-'}</td>
                    <td className="px-3 py-2">{u.email ?? '-'}</td>
                    <td className="px-3 py-2">
                      <button onClick={() => deleteUser(u._id)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create user modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl">
            <h3 className="text-lg font-semibold mb-4">Create User</h3>
            <form onSubmit={createUser}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input name="name" value={userForm.name} onChange={handleUserChange} placeholder="Full name" className="input" required />
                <input name="email" value={userForm.email} onChange={handleUserChange} placeholder="Email" className="input" />
                <select name="role" value={userForm.role} onChange={handleUserChange} className="input">
                  <option value="system_admin">System Admin</option>
                  <option value="departmental_admin">Departmental Admin</option>
                  <option value="lecturer_admin">Lecturer Admin</option>
                  <option value="bursary_admin">Bursary Admin</option>
                  <option value="staff">Staff</option>
                  <option value="student">Student</option>
                </select>
                <input name="staffId" value={userForm.staffId} onChange={handleUserChange} placeholder="Staff ID" className="input" />
                <input name="matricNumber" value={userForm.matricNumber} onChange={handleUserChange} placeholder="Matric Number" className="input" />
                <select name="department" value={userForm.department} onChange={handleUserChange} className="input">
                  <option value="">-- Select Department --</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={closeUserModal} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

  {/* Departments management */}
      <div className="mt-6 bg-white rounded-lg p-4 border shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold mb-4">Departments</h2>
          <div>
            <button onClick={() => { setDeptForm({ name: '', code: '' }); setShowDeptModal(true); }} className="btn-primary">Create Department</button>
          </div>
        </div>

        <DepartmentsList
          departments={departments}
          onDelete={async (id) => {
            if (!confirm('Delete this department?')) return;
            try {
              const res = await axios.delete(`/api/admin/departments/${id}`);
              if (res.data?.success) {
                setDepartments(prev => prev.filter(d => d._id !== id));
              }
            } catch (err) {
              console.error('Delete department failed', err);
              alert(err.response?.data?.message || 'Failed to delete department');
            }
          }}
          onEdit={(dept) => {
            setDeptForm({ name: dept.name || '', code: dept.code || '', _id: dept._id });
            setShowDeptModal(true);
          }}
        />
      </div>

      {/* Courses management */}
      <div className="mt-6 bg-white rounded-lg p-4 border shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold mb-4">Courses</h2>
          <div>
            <button onClick={() => { openCreateCourse(); }} className="btn-primary">Create Course</button>
          </div>
        </div>

        {coursesLoading ? (
          <p className="text-slate-600">Loading courses...</p>
        ) : (
          <CoursesList
            courses={courses}
            onEdit={(c) => { setCourseForm({ code: c.code, title: c.title, department: c.department?._id || '', credit: c.credit, level: c.level, _id: c._id, departments_offering: c.departments_offering || [] }); setShowCourseModal(true); }}
            onDelete={deleteCourse}
          />
        )}
      </div>

      {/* Course modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl">
            <h3 className="text-lg font-semibold mb-4">{courseForm._id ? 'Edit Course' : 'Create Course'}</h3>
            <form onSubmit={saveCourse}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input name="code" value={courseForm.code} onChange={handleCourseChange} placeholder="Course code (e.g., CSC101)" className="input" required />
                <input name="title" value={courseForm.title} onChange={handleCourseChange} placeholder="Course title" className="input" required />
                <select name="department" value={courseForm.department} onChange={handleCourseChange} className="input">
                  <option value="">-- Select Department --</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
                <input name="level" type="number" value={courseForm.level} onChange={handleCourseChange} placeholder="Level (e.g., 100)" className="input" />
                <input name="credit" type="number" value={courseForm.credit} onChange={handleCourseChange} placeholder="Credit hours" className="input" />
              </div>

              {/* Offerings editor: allow adding department-specific offerings */}
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Department Offerings (optional)</h4>
                {(courseForm.departments_offering || []).map((off, idx) => (
                  <div key={idx} className="p-3 border rounded mb-2">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <select className="input" value={off.department || ''} onChange={(e) => {
                        const val = e.target.value;
                        setCourseForm(prev => {
                          const arr = [...(prev.departments_offering || [])];
                          arr[idx] = { ...(arr[idx] || {}), department: val };
                          return { ...prev, departments_offering: arr };
                        });
                      }}>
                        <option value="">-- Dept --</option>
                        {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                      </select>
                      <input className="input" type="number" value={off.level || 100} onChange={(e) => {
                        const v = Number(e.target.value || 100);
                        setCourseForm(prev => {
                          const arr = [...(prev.departments_offering || [])];
                          arr[idx] = { ...(arr[idx] || {}), level: v };
                          return { ...prev, departments_offering: arr };
                        });
                      }} />
                      <select className="input" value={off.semester || 'both'} onChange={(e) => {
                        const v = e.target.value;
                        setCourseForm(prev => {
                          const arr = [...(prev.departments_offering || [])];
                          arr[idx] = { ...(arr[idx] || {}), semester: v };
                          return { ...prev, departments_offering: arr };
                        });
                      }}>
                        <option value="both">Both</option>
                        <option value="first">First</option>
                        <option value="second">Second</option>
                      </select>
                      <input className="input" placeholder="Lecturer ID (optional)" value={off.lecturerId || ''} onChange={(e) => {
                        const v = e.target.value;
                        setCourseForm(prev => {
                          const arr = [...(prev.departments_offering || [])];
                          arr[idx] = { ...(arr[idx] || {}), lecturerId: v };
                          return { ...prev, departments_offering: arr };
                        });
                      }} />
                    </div>
                    <div className="mt-2 text-right">
                      <button type="button" className="text-red-600" onClick={() => {
                        setCourseForm(prev => ({ ...prev, departments_offering: (prev.departments_offering || []).filter((_, i) => i !== idx) }));
                      }}>Remove</button>
                    </div>
                  </div>
                ))}

                <div>
                  <button type="button" className="btn-secondary" onClick={() => {
                    setCourseForm(prev => ({ ...prev, departments_offering: [...(prev.departments_offering || []), { department: '', level: 100, semester: 'both', lecturerId: '' }] }));
                  }}>Add Offering</button>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={closeCourseModal} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Buildings management */}
      <div className="mt-6 bg-white rounded-lg p-4 border shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold mb-4">Buildings</h2>
          <div>
            <button onClick={() => { setBuildingForm({ name: '', location: '', department: '' }); setShowBuildingModal(true); }} className="btn-primary">Create Building</button>
          </div>
        </div>

        {buildingsLoading ? (
          <p className="text-slate-600">Loading buildings...</p>
        ) : (
          <BuildingsList
            buildings={buildings}
            onEdit={(b) => { setBuildingForm({ name: b.name, location: b.location || '', department: b.department?._id || '', _id: b._id }); setShowBuildingModal(true); }}
            onDelete={deleteBuilding}
          />
        )}
      </div>

      {/* Building modal */}
      {showBuildingModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{buildingForm._id ? 'Edit Building' : 'Create Building'}</h3>
            <form onSubmit={saveBuilding}>
              <div className="grid grid-cols-1 gap-3">
                <input name="name" value={buildingForm.name} onChange={handleBuildingChange} placeholder="Building name" className="input" required />
                <input name="location" value={buildingForm.location} onChange={handleBuildingChange} placeholder="Location / Address" className="input" />
                <select name="department" value={buildingForm.department} onChange={handleBuildingChange} className="input">
                  <option value="">-- Assign Department (optional) --</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={closeBuildingModal} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      

      {/* Department modal */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{deptForm._id ? 'Edit Department' : 'Create Department'}</h3>
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
            }}>
              <div className="space-y-3">
                <input className="input" name="name" value={deptForm.name} onChange={(e) => setDeptForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Department name" required />
                <input className="input" name="code" value={deptForm.code} onChange={(e) => setDeptForm(prev => ({ ...prev, code: e.target.value }))} placeholder="Department code (short)" />
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowDeptModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default SystemAdminPage;
