# Cricket Quiz App

This repository contains a React + TypeScript frontend (Vite) and an Express + MongoDB backend scaffold.

## How to run locally

Prerequisites:
- Node.js (v18+)
- MongoDB (Compass/local on `mongodb://localhost:27017`) or Atlas

Steps:

Quick one-command setup (recommended):

```powershell
# From the repository root (PowerShell)
cd 'C:\Users\anishek raut\Downloads\cricket-quiz-championship18-main\cricket-quiz-championship18-main'
# Install dependencies for both frontend and server, then run both dev servers
.\\start-dev.ps1
```

Manual (separate terminals):

```powershell
# Frontend (from repo root)
cd 'C:\Users\anishek raut\Downloads\cricket-quiz-championship18-main\cricket-quiz-championship18-main'
npm run bootstrap
npm run dev:client

# Server (in separate terminal)
cd 'C:\Users\anishek raut\Downloads\cricket-quiz-championship18-main\cricket-quiz-championship18-main\server'
npm install
npm run dev
```

The frontend expects the server API to be available at `VITE_API_URL` (default `http://localhost:4000/api`).  
The server will automatically connect to `mongodb://localhost:27017/cricket-quiz` if `MONGODB_URI` is not provided; to override it, create `server/.env` with `MONGODB_URI=<your connection string>`.

## What technologies are used

- Frontend: Vite, React, TypeScript, Tailwind CSS
- Backend: Express, Mongoose (MongoDB)

## Deployment

Build the frontend with `npm run build` and deploy the `dist/` directory to any static host (Vercel, Netlify, GitHub Pages). Set `VITE_API_URL` at build time to the deployed backend URL.
