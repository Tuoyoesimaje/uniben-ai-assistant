const Course = require('../models/Course');

async function findCoursesForSystemAdmin() {
  return Course.find({})
    .populate('department', 'name')
    .populate('departments_offering.department', 'name')
    .populate('departments_offering.lecturerId', 'name staffId')
    .populate('prerequisites', 'code title')
    .sort({ code: 1 });
}

async function findCoursesForDepartment(departmentId) {
  return Course.find({
    $or: [
      { department: departmentId },
      { 'departments_offering.department': departmentId }
    ]
  })
    .populate('department', 'name')
    .populate('departments_offering.department', 'name')
    .populate('departments_offering.lecturerId', 'name staffId')
    .populate('prerequisites', 'code title')
    .sort({ code: 1 });
}

async function findCoursesForLecturer(lecturerId) {
  return Course.find({
    departments_offering: { $elemMatch: { lecturerId } }
  })
    .populate('department', 'name')
    .populate('departments_offering.department', 'name')
    .populate('departments_offering.lecturerId', 'name staffId')
    .populate('prerequisites', 'code title')
    .sort({ code: 1 });
}

module.exports = {
  findCoursesForSystemAdmin,
  findCoursesForDepartment,
  findCoursesForLecturer
};
