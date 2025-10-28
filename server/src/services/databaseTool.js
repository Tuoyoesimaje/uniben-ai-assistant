const Building = require('../models/Building');
const Department = require('../models/Department');
const Course = require('../models/Course');

async function queryDatabaseTool({ queryType, searchTerm }) {
  try {
    let results;

    switch (queryType) {
      case 'building':
        results = await Building.find({
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { department: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } }
          ]
        }).limit(5);

        return {
          type: 'building',
          results: results.map(b => ({
            id: b._id,
            name: b.name,
            department: b.department,
            location: { lat: b.latitude, lng: b.longitude },
            photoURL: b.photoURL,
            description: b.description
          }))
        };

      case 'department':
        results = await Department.find({
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { faculty: { $regex: searchTerm, $options: 'i' } }
          ]
        }).limit(5);

        return {
          type: 'department',
          results: results.map(d => ({
            name: d.name,
            faculty: d.faculty,
            hodName: d.hodName,
            hodContact: d.hodContact,
            location: d.location
          }))
        };

      case 'course':
        results = await Course.find({
          $or: [
            { code: { $regex: searchTerm, $options: 'i' } },
            { title: { $regex: searchTerm, $options: 'i' } },
            { department: { $regex: searchTerm, $options: 'i' } }
          ]
        }).limit(10);

        return {
          type: 'course',
          results: results.map(c => ({
            code: c.code,
            title: c.title,
            department: c.department,
            credit: c.credit,
            level: c.level
          }))
        };

      case 'hod':
        results = await Department.find({
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { hodName: { $regex: searchTerm, $options: 'i' } }
          ]
        }).limit(5);

        return {
          type: 'hod',
          results: results.map(d => ({
            department: d.name,
            hodName: d.hodName,
            hodContact: d.hodContact,
            office: d.location
          }))
        };

      default:
        return { type: 'error', message: 'Invalid query type' };
    }
  } catch (error) {
    console.error('Database query error:', error);
    return { type: 'error', message: 'Failed to query database' };
  }
}

module.exports = { queryDatabaseTool };