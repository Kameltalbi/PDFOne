# Mini PDF Tools

A web-based PDF processing application allowing users to manipulate PDF files without account registration or installation.

## MVP Features

The MVP includes 5 core PDF tools:

1. **Merge PDF** - Combine multiple PDFs into a single file with reordering
2. **PDF to JPG** - Convert each PDF page to an image
3. **Compress PDF** - Reduce file size while maintaining quality
4. **Protect PDF** - Encrypt PDF with password protection
5. **Add Text** - Insert free text onto PDF pages

## Project Structure

```
mini-pdf-tools/
├── client/          # React + Vite frontend application
├── server/          # Express + TypeScript backend API
├── shared/          # Shared types and utilities
├── temp/            # Temporary file storage (auto-cleanup)
└── package.json     # Root package.json with workspace scripts
```

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite for build tooling
- React Router for navigation
- Axios for API communication

### Backend
- Node.js + Express
- TypeScript
- Multer for file uploads
- pdf-lib for PDF manipulation
- Sharp for image conversion
- BullMQ for job queuing
- Redis for queue management

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Redis (for job queue)

### Installation

1. Clone the repository and navigate to the project:
```bash
cd mini-pdf-tools
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp server/.env.example server/.env
# Edit server/.env with your configuration
```

4. Start Redis (required for BullMQ):
```bash
redis-server
```

### Development

Run both client and server in development mode:
```bash
npm run dev
```

Or run individually:
```bash
npm run dev:client  # Frontend on http://localhost:5173
npm run dev:server  # Backend on http://localhost:3002
```

### Build

Build for production:
```bash
npm run build
```

## API Endpoints

- `POST /api/merge` - Merge multiple PDFs
- `POST /api/to-jpg` - Convert PDF to JPG images
- `POST /api/compress` - Compress PDF file
- `POST /api/protect` - Add password protection
- `POST /api/add-text` - Add text to PDF

## Security & Privacy

- No account registration required
- Files automatically deleted after 2 hours
- HTTPS encryption in transit
- No data reuse or storage beyond processing
- GDPR compliant

## Development Roadmap

### Week 1 - Foundations
- ✅ Project setup
- ⏳ Upload functionality
- ⏳ Merge PDF tool

### Week 2 - Tools
- ⏳ PDF to JPG conversion
- ⏳ PDF compression
- ⏳ Password protection
- ⏳ Add text functionality

### Week 3 - Polish
- ⏳ Homepage with tool listing
- ⏳ File cleanup automation
- ⏳ Usage limits
- ⏳ Deployment

## License

Proprietary - All rights reserved
