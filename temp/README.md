# Temporary File Storage

This directory is used for temporary storage of uploaded and processed PDF files.

## Purpose
- Store uploaded files during processing
- Store processed files before download
- Automatic cleanup after TTL (Time To Live)

## File Lifecycle
1. User uploads file → stored in temp directory
2. File is processed → result stored in temp directory
3. User downloads result → file is deleted immediately after the download
4. If the result is not downloaded, a cleanup job deletes it after `TEMP_FILE_TTL` (default 15 minutes)

## Cleanup Mechanism
- One-shot download via `GET /temp/:name` then unlink
- TTL-based purge (`TEMP_FILE_TTL`, default 900000 ms)
- Scheduled cleanup every 5 minutes

## Security
- Files are not accessible directly via URL without proper authorization
- HTTPS encryption in transit
- No sensitive data is stored long-term
- Files are deleted after processing and expiration

## Configuration
Environment variables in `server/.env`:
- `TEMP_FILE_TTL`: Time in milliseconds before undownloaded files are deleted (default: 900000 = 15 minutes)
- `MAX_FILE_SIZE`: Absolute upload cap in bytes (default: 1 GB). Free plan is limited to 50 MB in application code.

## Notes
- Do not manually add files to this directory
- Do not rely on files persisting beyond the TTL
- This directory should be ignored by version control
