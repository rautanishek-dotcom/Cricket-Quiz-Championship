# Cricket Quiz App - Setup

## Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)

## Installation (local)

1. Install frontend dependencies and start dev server:
```powershell
cd 'C:\Users\anishek raut\Downloads\cricket-quiz-championship18-main\cricket-quiz-championship18-main'
npm install
npm run dev
```

2. Start the server (in a separate terminal):
```powershell
cd server
npm install
npm run dev
```

## Environment
- Use `.env` in `server/` for MongoDB and JWT secret (`MONGODB_URI`, `JWT_SECRET`).
- Use `VITE_API_URL` in the frontend env to point to the server API (default `http://localhost:4000/api`).

## Available Commands
- `npm run dev` - Start frontend dev server
- `npm run build` - Build frontend for production
- `npm run preview` - Preview frontend production build
- `cd server && npm run dev` - Start Express server

## Database
- MongoDB collections: `users`, `questions`, `results`, `user_roles` (optional)

## Notes
- This project no longer depends on Supabase or Lovable. The backend is a local Express server using MongoDB.

