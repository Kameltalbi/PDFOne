# Temporary File Storage

This directory is used for temporary storage of uploaded and processed PDF files.

## Purpose
- Store uploaded files during processing
- Store processed files before download
- Automatic cleanup after TTL (Time To Live)

## File Lifecycle
1. User uploads file → stored in temp directory
2. File is processed → result stored in temp directory
3. User downloads result → file remains for potential re-download
4. TTL expires (default: 2 hours) → file automatically deleted

## Cleanup Mechanism
The server implements automatic cleanup using:
- TTL-based expiration (configurable via `TEMP_FILE_TTL` env var)
- Scheduled cleanup job runs periodically to remove expired files
- Files are deleted securely without recovery

## Security
- Files are not accessible directly via URL without proper authorization
- HTTPS encryption in transit
- No sensitive data is stored long-term
- Files are deleted after processing and expiration

## Configuration
Environment variables in `server/.env`:
- `TEMP_FILE_TTL`: Time in milliseconds before files are deleted (default: 7200000 = 2 hours)
- `MAX_FILE_SIZE`: Maximum upload size in bytes (default: 104857600 = 100MB)

## Notes
- Do not manually add files to this directory
- Do not rely on files persisting beyond the TTL
- This directory should be ignored by version control
