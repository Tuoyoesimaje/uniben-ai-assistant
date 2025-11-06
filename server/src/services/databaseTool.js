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
        // Parse searchTerm to extract level and department
        let levelMatch = searchTerm.match(/(\d+)\s*level/i);
        let departmentMatch = searchTerm.match(/computer science/i);
        
        let query = {};
        let populateDept = false;
        
        if (levelMatch) {
          query.level = parseInt(levelMatch[1]);
          populateDept = true;
        }
        
        if (departmentMatch) {
          // If looking for Computer Science, we need to populate department to filter
          results = await Course.find(query).populate('department').limit(10);
          
          // Filter results to only include Computer Science department
          results = results.filter(course =>
            course.department &&
            course.department.name &&
            course.department.name.toLowerCase().includes('computer science')
          );
        } else if (populateDept) {
          // If we have level but no department, still populate to get department name
          results = await Course.find(query).populate('department').limit(10);
        } else {
          // Original search for other terms - populate department if searching by department
          results = await Course.find({
            $or: [
              { code: { $regex: searchTerm, $options: 'i' } },
              { title: { $regex: searchTerm, $options: 'i' } },
              { department: { $regex: searchTerm, $options: 'i' } }
            ]
          }).populate('department').limit(10);
        }

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