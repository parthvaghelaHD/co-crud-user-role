# User & Role Management System  
Tech Stack: **Node.js, Express.js, MongoDB**

This project includes:
- User Authentication (JWT based)
- User CRUD
- Role CRUD
- Role assignment to users
- Security middlewares (helmet, cors, xss-clean, mongo sanitize)


## ⚙️ Installation

```bash
git clone <repo-url>
cd <project-folder>
npm install

🔐 Environment Variables

Create a .env file based on the .env.local file

🚀 Start the Server
npm start

Server runs at: http://localhost:5000

== AUTH ROUTES, USER ROUTES,  ROLE ROUTES, JWT Security

Protected routes must include:
Authorization: Bearer <token>

Security Packages Used
=============================
Package	Purpose
helmet	Secures HTTP headers
cors	Allows cross-origin requests
xss-clean	Protects against XSS
express-mongo-sanitize	Prevents MongoDB injection
