# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PetSocial is a pet-themed social network with four independent sub-applications:

| Module | Tech | Port | Purpose |
|--------|------|------|---------|
| `server/` | Express + MySQL + Sequelize | 3001 | Main REST API |
| `frontend/` | UniApp + Vue 3 | varies | Cross-platform mobile client (H5/WeChat/App) |
| `admin/` | Vue 3 + Vite + Element Plus | 5173 | Admin management panel |
| `dataDB/` | Express + MongoDB + Mongoose | 3005 | Pet encyclopedia microservice |

Each module has its own `package.json` and must be started independently.

## Commands

### Server (`server/`)
```bash
cd server
npm install
npm start        # starts on PORT from .env (default 3001)
```

Required `.env` variables:
```
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pet_social
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.qq.com
EMAIL_PORT=465
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
ADMIN_EMAIL=admin@petsocial.com
```

The server auto-creates the MySQL database and seeds initial categories, topics, and admin account on startup via `sequelize.sync({ alter: true })`.

### Frontend (`frontend/`)
```bash
cd frontend
npm install
npm run dev:h5           # H5 browser development
npm run dev:mp-weixin    # WeChat mini-program
npm run build:h5         # Production H5 build
npm run build:mp-weixin  # Production mini-program build
```

For real device testing, change `BASE_URL` in `src/utils/request.js` to the computer's LAN IP.

### Admin (`admin/`)
```bash
cd admin
npm install
npm run dev     # dev server at http://localhost:5173
npm run build   # production build
```

Proxies `/api/*` requests to `http://localhost:3001` (server must be running).

### DataDB (`dataDB/`)
```bash
cd dataDB
npm install
npm start       # starts on PORT from .env (default 3005)
```

Required `.env`: `PORT=3005`, `MONGODB_URI=mongodb://127.0.0.1:27017/petEncyclopedia`

## Architecture

### Server Architecture

Routes are in `server/src/routes/` — one file per domain — and registered in `server/src/app.js` under `/api/<domain>`. Business logic lives directly in route files (no separate controller layer).

**API route map:**
- `/api/account` — registration, login, JWT auth, email verification codes, password reset
- `/api/post` — CRUD, likes, dislikes (`PostLike`, `PostDislike`), "not interested" blocking
- `/api/comment` — nested comments on posts
- `/api/follow` — follow/unfollow between pet accounts
- `/api/pet` — pet profile management, block author (`BlockPet`)
- `/api/topic` — topic (hashtag) management, post-topic associations (`PostTopic`)
- `/api/category` — content categories
- `/api/bookmark` — saved posts
- `/api/point` — points system with logs (`PointLog`)
- `/api/upload` — Multer-based image upload, files stored in `server/src/public/images/`

**Auth flow:** JWT tokens via `Authorization: Bearer <token>` header. Auth middleware is in `server/src/middleware/auth.js`. Token expiry is 7 days by default.

**Models** are Sequelize models in `server/src/models/`. All exported from `index.js` with associations defined there. Key relationships:
- `Account` has one `Pet` (profile)
- `Post` belongs to `Account` (via `Pet`), has many `Comment`, `PostLike`, `PostDislike`, `PostTopic`
- `Follow` is a self-join on Pet IDs

### Frontend Architecture

UniApp single codebase compiles to multiple platforms. Pages are registered in `src/pages.json`.

**Page modules:** `index`, `post`, `baike` (encyclopedia), `profile`, `user`, `follow`, `discuss`, `activity`, `points`, `login`, `register`

**API communication:** All HTTP calls go through `src/utils/request.js`, which wraps `uni.request` with JWT token injection from storage and unified error handling (code=0 is success, code=401 triggers logout).

### Admin Architecture

Single-page Vue 3 app. Views: `Login`, `Layout` (shell), `PostList`, `CategoryList`, `TopicList`, `CommentList`. Communicates with `server/` via Vite proxy — no CORS configuration needed in development.

### DataDB Architecture

Self-contained Express app (`dataDB/index.js`) with all routes defined inline. Serves pet encyclopedia data from MongoDB. Separate from `server/` because it uses document-style data vs. relational social data.
