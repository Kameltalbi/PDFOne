# Mini PDF Tools - Project Information

## Project Overview
Web-based PDF processing application with 5 core tools in MVP phase.

## Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **PDF Processing**: pdf-lib, Sharp
- **Queue**: BullMQ + Redis
- **File Upload**: Multer

## Development Commands
- `npm run dev` - Start both client and server (recommended)
- `npm run dev:client` - Start frontend only (http://localhost:5173)
- `npm run dev:server` - Start backend only (http://localhost:3002)
- `npm run build` - Build both client and server
- `npm run clean` - Clean build artifacts and temp files

## Project Structure
```
client/          # React frontend (Vite)
server/          # Express backend API
shared/          # Shared types and utilities
temp/            # Temporary file storage (auto-cleanup)
```

## Environment Setup
1. Copy `server/.env.example` to `server/.env`
2. Configure Redis for BullMQ job queue
3. Server runs on port 3002 (conflict with port 3001)

## Key Dependencies
- **Client**: react, react-dom, react-router-dom, axios
- **Server**: express, cors, multer, pdf-lib, sharp, bullmq, ioredis, uuid
- **Shared**: typescript

## Known Issues
- Some npm audit warnings for deprecated packages (multer, uuid) - but functional
- Redis required for job queue functionality
- Port 3001 conflicts, using 3002 instead

## Development Notes
- Workspace-based monorepo structure
- Shared types between client and server
- Temporary files auto-delete after 2 hours (configurable)
- File upload limit: 100MB (configurable)
