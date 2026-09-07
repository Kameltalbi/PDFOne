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
- `QUEUE_WAIT_TIMEOUT_MS`, `PDF_RUN_TIMEOUT_MS`, `OFFICE_RUN_TIMEOUT_MS`, `OCR_RUN_TIMEOUT_MS`
- `MIN_FREE_TEMP_BYTES`
- `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`
- Stripe / LibreOffice / Tesseract / OpenAI as needed

## Limits to remember

- Free: 20 MB / file, 3 docs / day (default)
- Paid: up to absolute max (default 1 GB, capped by `MAX_FILE_SIZE`)
- Temp results: ~15 minutes TTL; retained files are not purged while pinned
- Native OS temp dirs prefixed `pdfone-*` are purged when abandoned
- JSON entitlements/users use atomic writes + cross-process lockfiles under `data/`
- Port **3002** for the API (avoid 3001 conflicts)

## Health

- `GET /health` — liveness + queues + memory + disk + converter presence + event-loop lag
- `GET /health/ready` — readiness including LibreOffice/Tesseract `--version` pings

See `capacity/` for load stages and fixtures. See `e2e/` for Playwright user journeys and the Stripe manual checklist. Do not invent concurrency numbers without measurement.

## Notes

- User-facing copy should not brand LibreOffice; it remains a server dependency.
- Prefer `forEachRasterPage` over buffering every page when adding raster pipelines.
- Keep quota, rate-limit, and job admission as three separate layers.
