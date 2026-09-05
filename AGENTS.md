# One2PDF — agent notes

## Overview

Production PDF tools site (one2pdf.com): React client + Express API. Many tools beyond the original 5-tool MVP.

## Stack (actual)

- **Client**: React 19 + TypeScript + Vite
- **Server**: Node.js + Express + TypeScript
- **PDF**: pdf-lib, pdf.js (`pdfjs-dist`), Sharp, `@napi-rs/canvas`
- **Office**: LibreOffice CLI on the host (`LIBREOFFICE_PATH` / `soffice`)
- **OCR**: Tesseract (`TESSERACT_PATH`)
- **Jobs**: in-memory bounded queues (`server/src/utils/jobQueue.ts`) — **not** BullMQ/Redis
- **Heavy CPU**: `worker_threads` pool (`HEAVY_WORKERS`) for compress and PDF→image
- **Upload**: Multer with plan-aware size limits applied during reception
- **Billing**: Stripe

## Commands

- `npm run dev` — client + server
- `npm run dev:client` — http://localhost:5173
- `npm run dev:server` — http://localhost:3002
- `npm run build` — client then server
- `npm run clean` — dist + temp

## Env

Copy `server/.env.example` → `server/.env`. Important knobs:

- `MAX_FILE_SIZE`, `MAX_FILES`, `TEMP_FILE_TTL`, `FREE_DAILY_DOCS`
- `PDF_CONCURRENCY` / `PDF_MAX_WAITING`, `OFFICE_*`, `OCR_*`
- `HEAVY_WORKERS`, `RASTER_MAX_PIXELS`
- `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`
- Stripe / LibreOffice / Tesseract / OpenAI as needed

## Limits to remember

- Free: 20 MB / file, 3 docs / day (default)
- Paid: up to absolute max (default 1 GB, capped by `MAX_FILE_SIZE`)
- Temp results: ~15 minutes TTL; retained files are not purged while pinned
- Port **3002** for the API (avoid 3001 conflicts)

## Capacity / audits

See `capacity/` for local fixtures, stage runners, and the priority corrections report. Do not invent concurrency numbers without measurement.

## Notes

- User-facing copy should not brand LibreOffice; it remains a server dependency.
- Prefer `forEachRasterPage` over buffering every page when adding raster pipelines.
- Keep quota, rate-limit, and job admission as three separate layers.
