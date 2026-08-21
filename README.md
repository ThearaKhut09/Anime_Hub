# 🎌 Anime Hub - Full Stack Anime Streaming Platform

A modern, responsive anime streaming and community platform built with **HTML5, CSS3, JavaScript (ES6+), jQuery, Plyr.js, Node.js, Express, and PostgreSQL**.

---

## 📁 Project Architecture (Option A: Split Architecture)

```text
Anime_Hub/
├── .gitignore                      # Git ignore rules for node_modules and secrets
├── README.md                       # Documentation & instructions
│
├── frontend/                       # Client-Side User Interface
│   ├── index.html                  # Homepage (Sliders, Trending, Popular shows)
│   ├── categories.html             # Catalog & Genre Filtering
│   ├── anime-details.html          # Anime Information, Synopsis, & Reviews
│   ├── anime-watching.html         # Video Player & Episode Switcher
│   ├── blog.html                   # Blog Articles Listing
│   ├── blog-details.html           # Single Blog Article & Discussion
│   ├── contacts.html               # Contact Form & Studio Details
│   ├── login.html                  # User Authentication Login
│   ├── signup.html                 # User Registration
│   ├── css/                        # Custom & Framework Stylesheets
│   ├── js/                         # Application logic & API helper (api.js)
│   ├── img/                        # Artwork, posters, banners & avatars
│   └── videos/                     # Sample anime video clips
│
└── backend/                        # Node.js + Express API & PostgreSQL
    ├── package.json                # Dependencies & scripts
    ├── .env.example                # Environment variables template
    ├── server.js                   # Express server entrypoint
    ├── config/
    │   └── db.js                   # PostgreSQL connection pool (pg)
    ├── db/
    │   ├── schema.sql              # Database schema (tables & indexes)
    │   └── seed.js                 # Seed script with initial anime catalog
    ├── middleware/
    │   ├── authMiddleware.js       # JWT validation & role check
    │   └── errorHandler.js         # Centralized error handler
    ├── controllers/                # Business logic (Auth, Anime, Reviews, Contacts)
    └── routes/                     # REST API route endpoints (/api/*)
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18 or higher (v24.x recommended)
- **PostgreSQL**: Local PostgreSQL server (Port 5432) OR Cloud PostgreSQL (Neon.tech, Supabase, Railway)

### 2. Install Backend Dependencies
Open your terminal in the `backend` folder:
```powershell
cd backend
npm install
```

### 3. Configure Database (.env)
Create a `.env` file inside the `backend/` folder (or copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/anime_hub
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
```

### 4. Initialize Database Tables & Seed Data
Run the automated migration and seed script:
```powershell
npm run seed
```

### 5. Start the Server
```powershell
npm run dev
```

Your full-stack website will be live at:
👉 **http://localhost:5000**

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create a new user account (Username, Email, Password)
- `POST /api/auth/login` - Authenticate user & retrieve JWT access token
- `GET /api/auth/me` - Fetch authenticated user profile

### Anime Catalog (`/api/anime`)
- `GET /api/anime` - Get all anime with optional filters (`?type=movies`, `?genre=action`, `?q=fate`, `?sort=rating`)
- `GET /api/anime/:id` - Get anime details including episodes and reviews
- `POST /api/anime` - Add new anime to catalog (Admin only)

### Reviews & Comments (`/api/reviews`)
- `POST /api/reviews/:animeId` - Post a review comment and star rating (JWT required)

### Contact Form (`/api/contacts`)
- `POST /api/contacts` - Submit a message from the contact page

---

## 🛡️ Git & GitHub Best Practices
This repository is configured with a root `.gitignore` to keep your commits clean and secure:
- `node_modules/` is automatically ignored.
- `.env` containing your database credentials is never pushed to public repositories.
