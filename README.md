# One2PDF

Web-based PDF tools (merge, compress, convert, OCR, Office conversions, etc.).

## Structure

```
client/     React + Vite frontend
server/     Express + TypeScript API
shared/     Shared TypeScript types
temp/       Temporary uploads/results (auto-cleanup)
capacity/   Local capacity audit scripts and reports
```

## Tech stack

- **Frontend**: React 19, TypeScript, Vite, React Router, Axios
- **Backend**: Node.js, Express, TypeScript, Multer, pdf-lib, Sharp, pdf.js
- **Office conversion**: LibreOffice on the server (`soffice`) — not Redis/BullMQ
- **OCR**: Tesseract on the server
- **Heavy PDF work**: in-process admission queues + `worker_threads` for compress / PDF→image
- **Billing**: Stripe

Redis/BullMQ are **not** used by the current application code. Admission is in-memory (`PDF_CONCURRENCY`, `OFFICE_CONCURRENCY`, `OCR_CONCURRENCY`).

## Setup

1. `npm install`
2. `cp server/.env.example server/.env` and edit secrets / limits
3. Optional: install LibreOffice and Tesseract for Office/OCR tools
4. `npm run dev` — client on http://localhost:5173, API on http://localhost:3002

## Limits (defaults)

| Limit | Default | Env |
|---|---|---|
| Free upload | 20 MB / file | — |
| Paid / absolute upload ceiling | 1 GB (or `MAX_FILE_SIZE` if lower) | `MAX_FILE_SIZE` |
| Free daily docs | 3 | `FREE_DAILY_DOCS` |
| Request rate limit | 30 / minute / IP | `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS` |
| PDF jobs | 2 active, 20 waiting | `PDF_CONCURRENCY`, `PDF_MAX_WAITING` |
| Office / OCR jobs | 1 active, 10 waiting each | `OFFICE_*`, `OCR_*` |
| Heavy workers | 1 | `HEAVY_WORKERS` |
| Temp file TTL | 15 minutes | `TEMP_FILE_TTL` |

Quota (commercial), rate limit (burst), and job queues (resource admission) are separate mechanisms.

Failed tool requests do not consume the free daily quota (reserved unit is released on 4xx/5xx).

## Health

`GET /health` returns process liveness plus queue stats and upload limits.

## Build

```bash
npm run build
npm run clean   # build artifacts + temp/*
```

## Privacy

Uploads are processed on the server, then deleted after download or TTL. See the in-app privacy policy for details.
