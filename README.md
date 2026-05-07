
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

Setup Instructions

1. Install dependencies
npm install

2. Start the development server
npm run dev
Environment Variables

If needed, update the API base URL in:

src/services/api.js

Example:

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

Test Login Credentials
Email: admin@example.com
Password: password123

Pages
Login
User authentication page
Dashboard
Shows total leads, new leads, qualified leads, won leads, lost leads, and total deal value
Leads
Displays all leads
Supports search
Supports filtering by status and source
Supports add, edit, and delete actions

How the App Works
User logs in with valid credentials
JWT token is stored in localStorage
Protected routes check for token
API requests automatically attach the token
Leads and dashboard data are fetched from the backend

Known Limitations
No dark mode yet
No toast notifications yet
No lead details page yet
No notes UI yet
No pagination yet
