
---

# `crm-frontend/README.md`

```md
# CRM Frontend

A modern CRM dashboard frontend built with React and Tailwind CSS.

## Features

- Login page
- Protected routes
- Dashboard overview
- Lead list with search and filtering
- Add/Edit/Delete leads
- Responsive sidebar and navbar
- Clean modern UI with Tailwind CSS

## Tech Stack

- React
- React Router DOM
- Axios
- Tailwind CSS
- React Icons

## Project Structure

```bash
crm-frontend/
├── src/
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── Sidebar.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Leads.jsx
│   │   └── Login.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
└── vite.config.js
