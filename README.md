# Mini Project Manager

A lightweight, full-stack Project Management web application built with Next.js 14 (App Router), Redux Toolkit, MongoDB with Mongoose, and JWT authentication.

---

## Features

- **Authentication**:
  - User signup and login with secure password hashing (`bcryptjs`, 10 rounds).
  - Stateless authentication via JSON Web Tokens (`jsonwebtoken`).
  - Protected frontend pages (`/projects`, `/projects/:id`) and REST API routes.
  - Client session persistence across refreshes via Redux Toolkit & LocalStorage.

- **Projects Management**:
  - Create, view, update, and delete individual projects (title, description).
  - Strict user-level data isolation (users can only access and manage their own projects).
  - Cascade deletion: deleting a project automatically cleans up all associated tasks.

- **Tasks Management**:
  - Tasks belong directly to a project and track `title`, `description`, `status` (`todo`, `in-progress`, `done`), and optional `dueDate`.
  - Create, edit, and delete tasks.
  - Quick inline status switcher.
  - Real-time status filtering (`All`, `To Do`, `In Progress`, `Done`).
  - Due date sorting (ascending / descending) and creation date sorting.

- **UI & Styling**:
  - Pure CSS (`globals.css`) — no external CSS libraries or frameworks.
  - Clean, accessible, responsive design for desktop and mobile viewports.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router, JavaScript)
- **State Management**: React + Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Database & ODM**: MongoDB with Mongoose
- **Authentication**: JWT (`jsonwebtoken`) + Password Hashing (`bcryptjs`)
- **API**: Next.js RESTful Route Handlers
- **Styling**: Vanilla CSS

---

## Project Structure

```text
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.js       # POST /api/auth/login
│   │   │   │   └── signup/route.js      # POST /api/auth/signup
│   │   │   ├── projects/
│   │   │   │   ├── route.js             # GET, POST /api/projects
│   │   │   │   └── [id]/
│   │   │   │       ├── route.js         # GET, PUT, DELETE /api/projects/:id
│   │   │   │       └── tasks/route.js   # GET, POST /api/projects/:id/tasks
│   │   │   └── tasks/
│   │   │       └── [id]/route.js        # GET, PUT, DELETE /api/tasks/:id
│   │   ├── login/page.js                # Login page
│   │   ├── signup/page.js               # Signup page
│   │   ├── projects/
│   │   │   ├── page.js                  # Projects dashboard
│   │   │   └── [id]/page.js             # Project tasks management
│   │   ├── globals.css                  # Global vanilla stylesheet
│   │   ├── layout.js                    # Root layout with Redux Provider & Navbar
│   │   └── page.js                      # Landing page
│   ├── components/
│   │   ├── Navbar.js                    # Responsive navigation bar
│   │   ├── ProtectedRoute.js            # Auth route guard
│   │   └── Providers.js                 # Redux store provider wrapper
│   ├── lib/
│   │   ├── api.js                       # Authenticated fetch client helper
│   │   ├── auth.js                      # JWT signing & verification helpers
│   │   └── db.js                        # Cached Mongoose connection handler
│   ├── models/
│   │   ├── User.js                      # User schema
│   │   ├── Project.js                   # Project schema
│   │   └── Task.js                      # Task schema
│   └── store/
│       ├── authSlice.js                 # Auth state & thunks
│       ├── projectSlice.js              # Projects state & thunks
│       ├── taskSlice.js                 # Tasks state & thunks
│       └── index.js                     # Redux store configuration
├── .env.example                         # Example environment variables
├── jsconfig.json                        # Path alias configuration (@/* -> ./src/*)
└── package.json
```

---

## Getting Started

### 1. Prerequisites
- Node.js 18.17+ (or 20+)
- npm, yarn, or pnpm
- MongoDB Atlas connection string (or a local MongoDB instance running on `mongodb://localhost:27017`)

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone <your-repo-url>
cd mini-task
npm install
```

### 3. Environment Configuration

Copy the example environment file and configure your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mini_project_manager?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
```

### 4. Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### 5. Production Build

```bash
npm run build
npm start
```

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/signup` - Create account `{ name, email, password }`
- `POST /api/auth/login` - Authenticate user `{ email, password }`

### Projects
- `GET /api/projects` - Get all projects of logged-in user
- `POST /api/projects` - Create a project `{ title, description }`
- `GET /api/projects/:id` - Get single project details
- `PUT /api/projects/:id` - Update project `{ title, description }`
- `DELETE /api/projects/:id` - Delete project and cascade-delete its tasks

### Tasks
- `GET /api/projects/:id/tasks` - List project tasks (Query params: `status`, `sortBy`, `order`)
- `POST /api/projects/:id/tasks` - Create task under project `{ title, description, status, dueDate }`
- `GET /api/tasks/:id` - Get single task
- `PUT /api/tasks/:id` - Update task `{ title, description, status, dueDate }`
- `DELETE /api/tasks/:id` - Delete task

---

## Implementation Notes

- **Mongoose Global Connection**: Next.js App Router hot reloads modules during development. A cached connection in `src/lib/db.js` prevents multiple active connections from exhausting the database pool.
- **Data Isolation**: All database operations query by `user: userId` extracted from the verified JWT token to ensure multi-tenant security.
- **Cascade Deletion**: When a project is removed via `DELETE /api/projects/:id`, all associated tasks referencing the project are deleted atomically.
- **Pure CSS**: Styling relies purely on modern CSS variables, flexbox, and CSS grid without any third-party UI framework dependencies.
