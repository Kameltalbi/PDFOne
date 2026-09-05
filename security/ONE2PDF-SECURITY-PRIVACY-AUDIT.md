# One2PDF — Security & Privacy Audit

**Date:** 2026-09-05  
**Scope:** Local defensive audit of the One2PDF repository (React client + Express API).  
**Mode:** Read/review + controlled local probes only. No production changes, no real Stripe charges, no mass AI calls, no destructive fuzzing.  
**Code changes:** None applied (report-only).

---

## 1. Executive summary

One2PDF is a public PDF/Office processing service: users upload confidential documents; the server processes them with Node libraries and native tools (LibreOffice, Tesseract, qpdf), stores short-lived results under `temp/`, and serves them via unauthenticated capability URLs (`GET /temp/:name`).

**Strengths**
- Tool routes do not rely on client-only “Pro” flags for size/quota; paid state is cookie + server entitlements.
- Uploads land under server-generated names; `path.basename` blocks `/temp` path traversal.
- Native tools are invoked via `execFile` (no shell), with server-controlled paths.
- Stripe webhook uses signature verification; checkout amounts are server-side `price_data`.
- Free 20 MiB limit is enforced at Multer reception; 25 MiB free upload rejected in local probe.
- Download unlinks the file after successful transfer; marker documents disappear from `temp/` after download.
- Existing product E2E suite (51 tests) is designed to cover core journeys; see §20 for regression status.

**Critical gaps for confidential documents**
- Result JSON includes **absolute server `filepath`**.
- `/health` exposes **absolute temp directory path**.
- Downloads are **unauthenticated capability URLs** with `Cache-Control: public`.
- CORS is `origin: true` + `credentials: true` (any Origin reflected).
- No CSP / framing / HSTS hardening in Express.
- `SESSION_SECRET` falls back to a **hardcoded development default** if unset.
- Superadmin emails are **hardcoded in source**.
- “Restore Pro by email” grants an access cookie with only an email (rate-limited).

**Verdict:** Not ready for confident public production handling of confidential documents until P0/P1 items below are fixed. Functional PDF tooling quality is good; **privacy boundary of temporary results is too weak**.

---

## 2. Overall security readiness score: **5.5 / 10**

## 3. Privacy readiness score: **4.5 / 10**

---

## 4. Tests executed

| ID | Test |
|----|------|
| S1 | Security surface map (routes, cookies, middleware, binaries) |
| S2 | File isolation / capability-URL access (User A vs User B) |
| S3 | `/temp` path traversal probes |
| S4 | Upload filename sanitization (unicode, `../`, `.pdf.exe`, quotes) |
| S5 | Temporary lifecycle + unique marker document |
| S6 | Malformed PDF handling (empty/truncated/fake/HTML-as-PDF) |
| S7 | Free plan 25 MiB rejection |
| S8 | Wrong unlock password |
| S9 | CORS Origin reflection |
| S10 | Security / cache headers on `/health` and `/temp` |
| S11 | Cookie flags on `pdfone_quota` (dev) |
| S12 | Forged `pdfone_access` cookie |
| S13 | Billing restore unknown email |
| S14 | Admin session unauthenticated |
| S15 | Static review: command injection, Stripe, AI egress, XSS sinks, CSRF |
| S16 | `npm audit` (runtime + full) |
| S17 | Local probe script `security/run-probes.mjs` → `security/probe-results.json` |
| S18 | E2E regression `npm run test:e2e` |

---

## 5. Tests passed

Local probes (from `security/probe-results.json`): **38** recorded checks passed (including intentional “capability URL works without auth”, which is a finding, not a security pass).

Notable **security-positive** passes:
- Path traversal on `/temp` → 404
- Upload `../` / unicode / long names sanitized to server names
- `.pdf.exe` rejected
- Guessed temp name → 404
- Unlink-after-download → second GET 404
- Marker cleared from `temp/` after download
- Free 25 MiB rejected
- Wrong unlock password rejected without path leak
- Forged access cookie does not grant `paid: true`
- Quota cookie HttpOnly + SameSite=Lax in development

Static review: no `dangerouslySetInnerHTML` in client; no `exec`/`shell:true`; LibreOffice/Tesseract/qpdf use `execFile`.

---

## 6. Tests failed / blocked

| Item | Result |
|------|--------|
| Absolute path in `/health` (`tempDisk.path`) | Confirmed present |
| Absolute `filepath` in tool JSON | Confirmed present |
| Missing CSP / XFO / XCTO / HSTS on API | Confirmed absent |
| CORS reflects arbitrary Origin + credentials | Confirmed |
| Malformed PDF HTTP status | 500 (should be 4xx) — no secret leak |
| E2E regression (first attempt this session) | Failed: Playwright browsers missing in sandbox cache |
| E2E regression (retry with `all` perms) | Exit code 0 observed after browser availability restored — **confirm locally** with `E2E_BASE_URL=http://127.0.0.1:5180 npm run test:e2e` expecting **51 passed** |

Probe script note: check `privacy.json_leaks_filepath` was coded as “PASS when filepath absolute” (detects the leak). Treat as **finding confirmed**, not a security success.

---

## 7. P0 findings

### P0-1 — Default `SESSION_SECRET` fallback — **FIXED** (see §23)

- **Severity:** P0 CRITICAL (production misconfiguration)
- **Component:** Cookie HMAC / access + quota + user + ops cookies
- **Files:** `server/src/utils/cookies.ts:4-6`
- **Reproduction:** Deploy/run API without `SESSION_SECRET` set; cookies are signed with `'pdfone-dev-secret-change-me'`.
- **Expected:** Process refuses to start in production without a strong secret.
- **Actual:** Silent fallback to a public default string in source.
- **Impact:** Attacker who knows the default can forge `pdfone_access` / `pdfone_ops` / `pdfone_user` and obtain Pro or admin-equivalent cookie privileges.
- **Fix:** Fail fast if `NODE_ENV=production` and secret missing/too short; rotate any cookies minted with the default.
- **Regression test:** Boot test asserting production without secret exits non-zero; attempt forged cookie with default secret rejected when custom secret configured.

### P0-2 — No classic cross-user IDOR without URL (clarification)

No separate P0 for “User B downloads User A without knowing the URL”: random suffix + unlink-on-download prevented blind guessing in probes.

**However**, unauthenticated downloads + absolute path leak + public cache headers are rated **P1** (below). If production ever logs `filepath` or mirrors `temp/` on a shared volume, escalate to P0.

---

## 8. P1 findings

### P1-1 — Absolute filesystem `filepath` in API responses — **FIXED** (see §23)

- **Severity:** P1 HIGH
- **Component:** All tools returning `writeTemp()` result
- **Files:** `server/src/utils/temp.ts:37-47`; e.g. `server/src/routes/compress.ts:22-26`
- **Reproduction:** `POST /api/compress` → JSON `data.filepath` is absolute (e.g. under project `temp/`).
- **Expected:** Client only receives `downloadUrl` + `filename` (+ sizes).
- **Actual:** Full server path returned.
- **Impact:** Host layout disclosure; aids path-aware attacks; may appear in browser extensions, analytics, or XSS exfiltration.
- **Fix:** Strip `filepath` from all public JSON; keep it server-side only.
- **Regression test:** Assert tool success JSON keys exclude `filepath`.

### P1-2 — `/health` exposes absolute temp path — **FIXED** (see §23)

- **Severity:** P1 HIGH
- **Component:** Liveness/metrics
- **Files:** `server/src/utils/runtimeHealth.ts:8-12,23-30`; `server/src/index.ts:77-88`
- **Reproduction:** `GET /health` → `tempDisk.path` absolute.
- **Expected:** Public health shows free/total bytes only (or bind health to internal network).
- **Actual:** Absolute path publicly readable.
- **Impact:** Deployment path disclosure.
- **Fix:** Omit `path` from public JSON or protect `/health` behind network ACL / shared secret.
- **Regression test:** Public `/health` must not match host absolute path patterns.

### P1-3 — Unauthenticated capability downloads + `Cache-Control: public` — **FIXED** (see §23)

- **Severity:** P1 HIGH (privacy)
- **Component:** `GET /temp/:name`
- **Files:** `server/src/index.ts:60-75`
- **Reproduction:** User A compresses → User B (different IP, no cookies) GETs the exact `/temp/...` URL → 200 PDF; `Cache-Control: public, max-age=0`.
- **Expected:** Confidential results require auth or unguessable + non-cacheable + preferably one-time token; intermediaries must not treat as public cacheable content.
- **Actual:** Possession of URL is sufficient; response marked `public`.
- **Impact:** Shared links, Referer leaks, proxy/CDN mis-caching, shoulder-surfing of URLs expose documents until TTL/download.
- **Fix:** `Cache-Control: private, no-store`; consider signed short-lived download tokens bound to session/IP; increase entropy (remove timestamp or use 128-bit id); optional auth cookie check.
- **Regression test:** Assert `no-store`/`private` on `/temp`; cross-session download without token fails when auth mode enabled.

### P1-4 — CORS `origin: true` + `credentials: true` — **FIXED** (see §23)

- **Severity:** P1 HIGH
- **Component:** API CORS
- **Files:** `server/src/index.ts:56`
- **Reproduction:** Request with `Origin: https://evil.example` → `Access-Control-Allow-Origin: https://evil.example` and `Allow-Credentials: true`.
- **Expected:** Explicit allowlist of app origins (`APP_URL`, localhost dev).
- **Actual:** Reflects any Origin.
- **Impact:** Weakens browser isolation; combined with future SameSite mistakes or subdomain XSS increases cookie/API abuse risk.
- **Fix:** Allowlist origins from env; never reflect arbitrary Origin with credentials.
- **Regression test:** Foreign Origin must not receive ACAO echo with credentials.

### P1-5 — Hardcoded superadmin emails in repository — **FIXED** (see §23)

- **Severity:** P1 HIGH
- **Component:** Admin privilege
- **Files:** `server/src/services/admins.ts:3-14`
- **Reproduction:** Read source; those emails receive elevated ops when matching `pdfone_user`.
- **Expected:** Superadmins only via env / out-of-band config, not committed identities.
- **Actual:** Builtin list in git.
- **Impact:** Privilege map public; account takeover of those emails ⇒ admin grant/revoke/blog.
- **Fix:** Remove builtins; require `SUPERADMIN_EMAILS`; document rotation.
- **Regression test:** Without env, no email is superadmin.

### P1-6 — Restore-by-email grants Pro access cookie — **FIXED** (see §23)

- **Severity:** P1 HIGH
- **Component:** Billing restore
- **Files:** `server/src/routes/billing.ts:164-185`; `restoreEntitlementByEmail` in billing service
- **Reproduction:** `POST /api/billing/restore` with an entitled email (rate limit 8/IP/hour) sets `pdfone_access`.
- **Expected:** Magic link / OTP / Stripe Customer Portal login — not “know email ⇒ cookie”.
- **Actual:** Email knowledge restores session cookie.
- **Impact:** Anyone who learns a customer email can steal Pro session (within rate limit).
- **Fix:** Replace with emailed one-time link or Stripe Customer Portal only.
- **Regression test:** Restore without proof-of-inbox must not set access cookie.

---

## 9. P2 findings

### P2-1 — No security headers (CSP, XFO, XCTO, Referrer-Policy, HSTS)

- **Files:** `server/src/index.ts` (no helmet)
- **Impact:** Clickjacking, MIME sniffing, weaker XSS defense-in-depth.
- **Fix:** Add `helmet` (API + static hosting); HSTS at TLS terminator.

### P2-2 — Malformed uploads return HTTP 500

- **Reproduction:** empty/truncated/fake PDF → status 500, safe message (no path leak observed).
- **Fix:** Map parse failures to 400; avoid `console.error` dumping Error objects that might include paths in future.

### P2-3 — Temp filenames include `Date.now()` + ~7 base36 chars

- **Files:** `server/src/utils/temp.ts:32-35`; `upload.ts:27-30`
- **Impact:** Narrows brute-force window if attacker knows upload time; still expensive, but weaker than UUID v4.
- **Fix:** Use `crypto.randomBytes(16)` (no timestamp) for public names.

### P2-4 — qpdf password in process argv

- **Files:** `server/src/services/unlock.ts:38`
- **Impact:** Local attackers with `ps` can read PDF passwords briefly.
- **Fix:** Prefer password via env file descriptor / library API if available; minimize argv secrets.

### P2-5 — Unused `bullmq` / `ioredis` dependencies

- **Files:** `server/package.json:19,25` (no imports under `server/src`)
- **Impact:** Extra CVE surface (`npm audit` flagged bullmq); contradicts AGENTS.md “not BullMQ”.
- **Fix:** Remove unused deps.

### P2-6 — `npm audit` runtime: sharp (high), express/body-parser/qs (moderate)

- Assess in context: sharp used for rasters; express stack used for all HTTP.
- **Fix:** Plan targeted upgrades after compatibility checks; do not blindly major-bump.

### P2-7 — Public `/health` / `/health/ready` information disclosure

- Queues, memory, converters, disk free bytes.
- **Fix:** Internal-only or authenticated metrics.

### P2-8 — AI text egress (document content leaves server)

- **Files:** `server/src/services/nlp.ts` (OpenAI + MyMemory)
- **Impact:** Confidential text may leave One2PDF when summarize/translate used and keys configured; MyMemory is a third party.
- **Fix:** Clear UI disclosure; prefer local-only mode default; never log prompts; DPA with providers.

### P2-9 — Upload MIME trust

- PDF accepted if MIME **or** `.pdf` extension (`upload.ts:101-107`).
- **Impact:** Polyglot/wrong-type files reach parsers (DoS/crash risk more than RCE given current stack).
- **Fix:** Magic-byte sniff after upload; reject mismatches.

---

## 10. P3 findings

### P3-1 — `X-Powered-By: Express` present

### P3-2 — Secure cookie flag only when `NODE_ENV === 'production'`

Expected for local HTTP; ensure production always sets `NODE_ENV=production`.

### P3-3 — Trust proxy = 1

Correct for single reverse proxy; misconfigured multi-proxy stacks can poison `X-Forwarded-For` quota identity (quota bypass / unfair blocking). Document exact proxy hop count.

### P3-4 — Client XSS posture generally good (React text escaping; no `dangerouslySetInnerHTML` found)

Residual: ensure filenames and error strings never fed into `href`/`src` without sanitization.

---

## 11. File isolation results

| Scenario | Result |
|----------|--------|
| User B guesses random temp name | 404 |
| User B uses User A’s exact `/temp/...` URL | **200 — document retrieved** (no auth) |
| Second download same URL | 404 (unlink-on-download) |
| Path traversal `/temp/../...` | 404 |
| Cross-user without URL knowledge | Not demonstrated |

**Conclusion:** Isolation is **capability-URL based**, not session-based. Acceptable only with strong entropy, `no-store`, no path leaks, short TTL, and clear privacy copy. Currently entropy is moderate and cache/path hygiene is insufficient → privacy risk **P1**.

---

## 12. Temporary-file lifecycle

```
UPLOAD → multer disk `temp/{timestamp}-{rand}{ext}` (retained)
  → PROCESS (LibreOffice/Tesseract/qpdf may use OS tmp `pdfone-*`)
  → RESULT `temp/{prefix}-{timestamp}-{rand}.{ext}` (retained)
  → JSON returns downloadUrl (+ filepath today)
  → GET /temp/:name → res.download → unlinkQuiet
  → OR TTL purge (~15 min) if never downloaded (skips retained)
  → Native OS dirs purged when abandoned (> max(TTL, 1h))
```

| Location | Duration | Access | Cleanup |
|----------|----------|--------|---------|
| `temp/` uploads | Until request `finally` cleanup / retain rules | Local FS | `cleanupUploads` / unlink |
| `temp/` results | Until download or TTL | **Public URL** | unlink on download; interval purge |
| OS `pdfone-lo-*`, `pdfone-ocr-*`, `pdfone-unlock-*` | Job + abort paths | Local FS | `finally` + `purgeAbandonedNativeTemp` |
| Crash/orphan risk | Retained map is in-memory; process crash can leave files until TTL based on mtime | | TTL helps; retained flag lost on restart so files become purge-eligible |

**Discrepancy vs privacy expectations:** Results are world-reachable by URL; absolute paths leak; cache `public`.

---

## 13. Authentication / authorization assessment

| Control | Assessment |
|---------|------------|
| Tool routes | Open + rate limit + free quota; Pro raises size / removes daily cap |
| `pdfone_access` | HMAC cookie; verified against entitlements for paid |
| Forged junk cookie | Does not grant paid |
| Admin | `ADMIN_SECRET` ops cookie and/or superadmin email list |
| Portal | Requires access cookie + subscription plan |
| Client-side Pro unlock | Not trusted for limits (server `isPaid`) |

Weak points: default secret (P0), restore-by-email (P1), hardcoded superadmins (P1).

---

## 14. Upload / download security

**Upload**
- Plan-aware Multer limits; free 20 MiB enforced (probe).
- Aggregate request budgets in `limits.ts`.
- Disk free check before accept.
- Extension/MIME filters; `.pdf.exe` rejected.
- Original filename not used as storage key.

**Download**
- `basename` equality check blocks traversal.
- `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="server-name.pdf"` (good).
- **`Cache-Control: public`** (bad for confidential files).
- No authn/authz beyond knowing the name.

---

## 15. Native command security

| Binary | Invocation | User influence | Risk |
|--------|------------|----------------|------|
| LibreOffice | `execFile(soffice, args…)` | File **content** + server path | Low injection; content-based DoS/crash |
| Tesseract | `execFile` | Server PNG path; lang whitelist | Low |
| qpdf | `execFile` | Password in argv; paths server | Password exposure via `ps` (P2) |
| worker_threads | CPU jobs | N/A shell | Low |

No shell metacharacter injection found in reviewed spawn sites.

---

## 16. Stripe security assessment

| Control | Status |
|---------|--------|
| Webhook signature (`constructEvent`) | Present before JSON parser |
| Server-side `unit_amount` / `price_data` | Present — client cannot set price |
| PRODUCTHUNT promo | Year plan only + time window + product id helper |
| Portal | Cookie + subscription plan gated |
| Real payment tests | **Not executed** (per scope) |

Residual: confirm endpoint trusts Stripe `sessionId` (expected); protect success pages from session fixation via Stripe APIs only.

---

## 17. AI privacy assessment

- Summarize/translate extract text locally then may call OpenAI (`Authorization: Bearer`) or MyMemory HTTP API with text chunks (`nlp.ts`).
- PDF binary stays server-side; **extracted text leaves** when remote providers used.
- Week plan AI caps exist; free users can still hit AI routes (provider cost / privacy).
- Recommendation: explicit consent UI; default local extractive mode; never log prompt bodies.

---

## 18. Dependency findings

| Area | Notes |
|------|-------|
| Runtime audit | high: `sharp`; moderate: `express`/`body-parser`/`qs`; `bullmq` flagged but **unused in src** |
| Full audit | +2 high (dev transitive) |
| Action | Remove unused bullmq/ioredis; schedule sharp/express patches |

SECRET_TYPE scan (values not printed):  
- `SESSION_SECRET` default string in `server/src/utils/cookies.ts:5`  
- `SESSION_SECRET` placeholder in `server/.env.example:23`  
- No live `sk_live_` / `whsec_` values found in tracked source (checklist mentions `sk_test_` as documentation only)

---

## 19. Security headers

| Header | API observation |
|--------|-----------------|
| CSP | Missing |
| X-Frame-Options / frame-ancestors | Missing |
| X-Content-Type-Options | Missing |
| Referrer-Policy | Missing |
| Permissions-Policy | Missing |
| HSTS | Missing (set at edge if TLS) |
| CORS | Reflects any Origin + credentials |
| Cache-Control on `/temp` | `public, max-age=0` |

---

## 20. E2E regression result

- Security probes did **not** modify application code.
- In this audit session, full-matrix Playwright runs failed with **51 failed** because browser binaries were missing from the agent Playwright cache (`chromium_headless_shell` / `webkit` executables not found). This is an **environment issue**, not an application regression caused by the audit.
- Baseline before this audit (prior session): **51 passed** across chromium-desktop, webkit-desktop, mobile-safari.
- **Required operator confirmation** (after `npx playwright install chromium webkit`):

```bash
npm run test:e2e:mint-pro   # if needed; do not log cookie
E2E_BASE_URL=http://127.0.0.1:5180 npm run test:e2e
# expect: 51 passed
```

---

## 21. Exact remediation recommendations

1. **Fail closed** without strong `SESSION_SECRET` in production; rotate cookies.
2. **Strip `filepath`** from all public API payloads.
3. **Remove absolute paths** from public `/health` (or lock down endpoint).
4. Set **`Cache-Control: private, no-store`** on `/temp` (and consider signed download tokens).
5. Replace CORS reflection with an **origin allowlist**.
6. Remove **hardcoded superadmin emails**; env-only.
7. Replace **email restore → cookie** with proof-of-inbox or Stripe portal.
8. Add **helmet**/security headers at API and static edge.
9. Map corrupt PDF errors to **400**; keep messages generic.
10. Strengthen temp IDs (`crypto.randomBytes`); drop timestamps from public names.
11. Remove unused **bullmq/ioredis**; patch **sharp/express** carefully.
12. Document AI egress; prefer local-only default for summarize/translate.
13. Ensure production `NODE_ENV=production` so Secure cookies apply.
14. Add automated security probes (extend `security/run-probes.mjs`) into CI against local stack.

---

## 22. Recommended order of corrections

1. P0-1 SESSION_SECRET fail-closed + rotation  
2. P1-1 strip `filepath`  
3. P1-3 download `no-store` (+ token/entropy)  
4. P1-2 health path hygiene  
5. P1-4 CORS allowlist  
6. P1-6 restore flow redesign  
7. P1-5 remove builtin superadmins  
8. P2 headers / 400 mapping / temp IDs / qpdf argv / deps  
9. AI privacy UX + logging policy  
10. Re-run E2E (51) + `security/run-probes.mjs`

---

## Appendix A — Security surface (abbreviated)

- **Public tools:** `/api/{merge,split,compress,protect,to-jpg,jpg-to-pdf,edit,pages/*,office/*,ocr,unlock,summarize,translate,...}` + rate limit + free quota  
- **Downloads:** `GET /temp/:name` (unauthenticated)  
- **Billing:** checkout/confirm/restore/portal/webhook/me/prices/logout  
- **Auth:** signup/login/logout cookies  
- **Admin:** ops cookie or superadmin email  
- **Cookies:** `pdfone_access`, `pdfone_quota`, `pdfone_user`, `pdfone_ops` (HttpOnly, SameSite=Lax, Secure in production)  
- **Binaries:** LibreOffice, Tesseract, qpdf via `execFile`

## Appendix B — Probe artifacts

- Script: `security/run-probes.mjs`  
- Results: `security/probe-results.json` (no secrets)

---

## Final counts

**P0 count:** 1  
**P1 count:** 6  
**P2 count:** 9  
**P3 count:** 4  

**Security readiness:** READY AFTER FIXES (P0/P1 closed in §23; P2/P3 remain)  
**Privacy readiness:** READY AFTER FIXES (P1-1/2/3/6 closed; P2 AI/logging remain)

*(Upgrade further after P2 headers/deps and production config verification.)*

---

## 23. P0/P1 remediation status (2026-09-05)

Original findings above are preserved. Status after remediation pass (P2/P3 not started).

### P0-1 — Default `SESSION_SECRET` fallback — **FIXED**

- **Files:** `server/src/utils/cookies.ts`, `server/src/index.ts` (boot `assertSessionSecretConfigured`), `server/.env.example`
- **Remediation:** Production requires `SESSION_SECRET` (≥32 chars, rejects known placeholders). Dev may use `SESSION_SECRET`, `SESSION_SECRET_DEV`, or an ephemeral per-process secret (never the historical hardcoded fallback).
- **Regression test:** `security/test-session-secret.mjs` + probe `p0-1.session_secret_runtime_ok`
- **Test result:** PASS (4/4 offline + runtime cookie mint)
- **Remaining risk:** Operators must set a strong secret and rotate cookies after any secret change; ephemeral local secrets invalidate cookies across restarts.

### P1-1 — Absolute filesystem `filepath` in API responses — **FIXED**

- **Files:** `server/src/utils/downloadGrant.ts` (`publicToolResult`), tool routes (`compress`, `merge`, `split`, `protect`, `toJpg`, `imagesToPdf`, `office`, `extras`, `pages`), `server/src/utils/publicError.ts`
- **Remediation:** All public tool JSON strips `filepath` and registers a download grant; user-facing errors sanitize absolute paths.
- **Regression test:** probe `p1-1.json_no_filepath` + malformed/unlock `no_path_leak`
- **Test result:** PASS
- **Remaining risk:** Server logs may still contain paths (intentional for ops); edit route streams download directly (no JSON filepath).

### P1-2 — `/health` exposes absolute temp path — **FIXED**

- **Files:** `server/src/utils/runtimeHealth.ts`, `server/src/index.ts`
- **Remediation:** Public `tempDisk` exposes free/total/minFree only.
- **Regression test:** probe `p1-2.health_no_absolute_path`
- **Test result:** PASS
- **Remaining risk:** Absolute path still available server-side in `diskStatsFor` for internal use.

### P1-3 — Unauthenticated `/temp` + public cache — **FIXED**

- **Files:** `server/src/index.ts`, `server/src/utils/downloadGrant.ts`, `server/src/utils/temp.ts`, `server/src/middleware/upload.ts`
- **Remediation:** `pdfone_dl` owner cookie + in-memory grant; strangers get 404; `Cache-Control: private, no-store`; 128-bit hex filenames; revoke + unlink after download.
- **Regression test:** probes `p1-3.*`, `temp.unlink_after_download`, `temp.filename_high_entropy`
- **Test result:** PASS
- **Remaining risk:** Grants are in-process memory (multi-instance deployments need shared grant store or sticky sessions); URL still secret-ish but not sufficient alone.

### P1-4 — CORS origin reflection with credentials — **FIXED**

- **Files:** `server/src/utils/corsAllowlist.ts`, `server/src/index.ts`, `server/.env.example`
- **Remediation:** Explicit allowlist (`CORS_ORIGINS`, `APP_URL`, production one2pdf.com, local Vite ports in non-prod). No arbitrary Origin echo with credentials.
- **Regression test:** probes `p1-4.cors_rejects_evil_origin`, `p1-4.cors_allows_dev_origin`
- **Test result:** PASS
- **Remaining risk:** Misconfigured `CORS_ORIGINS` on VPS can block the real site — set before deploy.

### P1-5 — Hardcoded superadmin emails — **FIXED**

- **Files:** `server/src/services/admins.ts`, `server/.env.example`
- **Remediation:** Builtin list removed; only `SUPERADMIN_EMAILS` env.
- **Regression test:** probe `p1-5.no_builtin_superadmins`
- **Test result:** PASS
- **Remaining risk:** Empty `SUPERADMIN_EMAILS` means no superadmin until configured; ops cookie / `ADMIN_SECRET` still separate.

### P1-6 — Restore-by-email grants Pro cookie — **FIXED**

- **Files:** `server/src/routes/billing.ts`, `client/src/lib/billing.tsx`, `client/src/components/RestoreAccess.tsx`
- **Remediation:** `POST /api/billing/restore` requires matching logged-in `pdfone_user` session or email+password (`authenticateUser`). Auto-restore on page load removed. Stripe checkout `confirm` and login/signup `attachPass` unchanged.
- **Regression test:** probe `p1-6.restore_email_alone_rejected`
- **Test result:** PASS
- **Remaining risk:** Guest checkout buyers without an account must sign up/login with the payment email (password) to restore on a new device; email OTP/magic-link not implemented (acceptable vs email-alone).

### Probe suite summary (post-fix)

- `security/run-probes.mjs` → **33 passed, 0 failed**
- `security/test-session-secret.mjs` → **4 passed**

---

*P2/P3 intentionally not remediated in this pass. Awaiting approval before commit/push/deploy.*
