Admin pages and routes

This document summarizes the frontend admin pages and server routes added/used in the project. It's a living reference while we restructure admin functionality.

Frontend pages (client/src/pages)

- /admin (redirect)
  - `AdminRedirect.jsx` - redirects users to role-specific admin pages based on `user.role`.

- /admin/system
  - `SystemAdminPage.jsx` - System Administrator dashboard. Current features implemented:
    - Users management: list, create, delete (uses `/api/admin/users`).
    - Departments management: list, create, edit, delete (uses `/api/admin/departments`).
    - Courses management: list, create, edit, delete (uses `/api/admin/courses`).
    - Buildings management: list, create, edit, delete (uses `/api/admin/buildings`).

- /admin/department
  - `DepartmentAdminPage.jsx` - Department admin UI placeholder (to be expanded).

- /admin/lecturer
  - `LecturerAdminPage.jsx` - Lecturer dashboard placeholder (to be expanded).

- /admin/bursary
  - `BursaryAdminPage.jsx` - Bursary admin placeholder (to be expanded).

Shared UI
- `components/admin/AdminLayout.jsx` - simple layout wrapper used by all admin pages.

Server routes (server/src/routes)

- `adminRoutes.js` - central admin API endpoints. Current endpoints used by the UI include:
  - GET /api/admin/stats
  - GET /api/admin/users
  - POST /api/admin/users
  - PUT /api/admin/users/:id
  - DELETE /api/admin/users/:id

  - GET /api/admin/departments
  - POST /api/admin/departments
  - PUT /api/admin/departments/:id
  - DELETE /api/admin/departments/:id

  - GET /api/admin/courses
  - POST /api/admin/courses
  - PUT /api/admin/courses/:id
  - DELETE /api/admin/courses/:id

  - GET /api/admin/buildings
  - POST /api/admin/buildings
  - PUT /api/admin/buildings/:id
  - DELETE /api/admin/buildings/:id

Notes / Next steps

1. Split server `adminRoutes.js` into role-specific route modules (systemAdminRoutes, departmentAdminRoutes, lecturerAdminRoutes, bursaryAdminRoutes) and centralize role middleware to make the server easier to reason about.
2. Expand Department / Lecturer / Bursary dashboards to include course-offering workflows, lecturer assignment, and fees management.
3. Migrate more features from the legacy `AdminPage.jsx` into the new role-specific pages gradually and write small UI + API tests as we go.

If you prefer, I can now:
- Implement server-side route split (backend) and wire middleware.
- Expand the course form to support `departments_offering` entries (departments + level + lecturer + schedule).
- Wire lecturer assignment UI in `DepartmentAdminPage.jsx`.

Tell me which of those you'd like me to take next.