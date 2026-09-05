# One2PDF — architecture audit and capacity test approval packet

Date: 2026-09-05. Status: repository audit and offline preparation only. **No One2PDF HTTP traffic, VPS stress test, production restart, payment, AI call, commit or push has been performed.** Application source and existing user edits are unchanged. Test assets live only under `capacity/`.

## Evidence and limits

This checkout runs on macOS; the available local runtime is Node v22.23.1 / npm 10.9.8. These are **not VPS measurements**. No deployment, PM2, reverse-proxy or SSH target configuration was found among the inspected project files. The deployed revision has not been compared with this checkout. No `.env`, customer data file, private key or payment credential was opened.

The user supplied `root@213.130.144.183`. SSH transport is reachable, but a read-only audit connection using the default local identities failed with `Permission denied (publickey,password)`; no remote command executed. A configured alias or authorized local identity path is needed, followed by the deployment path, actual service user, exact PM2 app name and public origin to finish Phase 1. An authorized synthetic test entitlement is also needed for processing load. Do not send credentials in chat; an existing test session can later be supplied through a local mode-0600 cookie file. No entitlement has been created and no quota bypass has been implemented.

| Required infrastructure fact | Current evidence |
|---|---|
| CPU model, cores, effective CPU quota, steal time | VPS unverified |
| RAM, effective cgroup limit, swap size/current use | VPS unverified |
| Disk capacity/free space, filesystem, inodes, storage device, I/O baseline | VPS unverified |
| VPS OS, Node and native binary versions | VPS unverified |
| PM2 mode, instances, PID, uptime, restart count, memory-restart limit, Node heap flags | No project PM2 config; runtime unverified |
| Reverse proxy/CDN, body limits, buffering, connect/read/send timeouts, connection limits | No project proxy config; runtime unverified |
| Active deployment revision, environment-dependent settings | Unverified; only explicitly approved nonsecret settings should be inspected |
| Redis/DB/worker processes in deployment | Source contains no active Redis/BullMQ/SQL client usage; deployed extras unverified |

To finish the host audit, run read-only commands through the supplied One2PDF SSH target: `uname -sr`, `nproc`, `lscpu`, `free -b`, `swapon --show --bytes`, `df -B1 <project> <effective-temp-root>`, `df -i <project> <effective-temp-root>`, `lsblk -o NAME,TYPE,SIZE,FSTYPE`, `node --version`, plus readable cgroup CPU/memory limit files. Never infer available capacity from nominal vCPU count alone. Inspect only the One2PDF proxy server block and allowlisted resource/timeout directives; do not dump all of `nginx -T`, full PM2 JSON, process command lines, environment or logs into reports. PM2 inspection must first confirm its daemon already exists, to avoid inadvertently starting one. Compare allowlisted source hashes/revision before claiming that these findings describe production.

## Architecture found in source

Sources are relative to the repository root.

| Area | Finding and capacity consequence | Source |
|---|---|---|
| Frontend/API | React/Vite SPA and Express; default API port 3002; `/health` only returns status and time, not dependency/queue health. Production static hosting is unknown. | `client/vite.config.ts`, `server/src/index.ts` |
| Execution | Request waits for processing completion. Async filesystem/native operations coexist with CPU work inside Node. No separate general PDF worker pool, admission limit or durable job API. | `server/src/routes/*`, `server/src/services/*` |
| Queue | BullMQ/ioredis are dependencies but have no active use in inspected source. Do not report Redis queue throughput from this checkout. | `server/package.json`, `server/src` |
| Office | One Promise-chain lock per Node process serializes LibreOffice calls. Waiting requests are unbounded; different PM2 instances would have independent locks. PDF→Excel bypasses LibreOffice and this lock. | `server/src/services/office.ts` |
| OCR | Separate per-process Promise lock. All pages rasterized before sequential OCR. Normally two Tesseract calls/page (text, then PDF), plus language discovery. OCR and Office may run simultaneously. | `server/src/services/ocr.ts` |
| Rasterization | PDF.js, native canvas and Sharp; full input copied/read into RAM; all page image buffers retained before assembly/ZIP. Output size and decoded pixels matter more than upload size alone. | `server/src/utils/rasterize.ts`, `server/src/services/toJpg.ts` |
| Compression | Low/medium rasterize pages and reassemble PDF. `high` is declared `null`, but `QUALITY_PRESETS[quality] ?? QUALITY_PRESETS.medium` resolves it to medium, making the intended non-raster branch unreachable for the defined options. Confirm behavior in functional baseline. | `server/src/services/compress.ts` |
| PDF libraries | pdf-lib, @cantoo/pdf-lib, pdfjs-dist; JSZip; Sharp/native canvas; heic-convert fallback; local signing via node-forge/@signpdf. | `server/package.json`, processing services |
| Native programs | LibreOffice, Tesseract; qpdf fallback for unlock. No active FFmpeg, ImageMagick or Ghostscript invocation found. Installed VPS binaries still need checking. | `office.ts`, `ocr.ts`, `unlock.ts` |
| Upload size | Free: 20 MiB/file; paid: 1 GiB/file. Multer's absolute limit is `max(1 GiB, configured MAX_FILE_SIZE)`, so a smaller configured value does not lower that initial disk-write cap. Free/paid size rejection occurs after upload. | `middleware/upload.ts`, `utils/limits.ts` |
| Upload counts | PDF merge at most 10 files; images at most 20; general configured/default count 20; Office one file. No aggregate upload byte budget found. | `routes/merge.ts`, `routes/imagesToPdf.ts`, `middleware/upload.ts` |
| Body limits | JSON 1 MB explicitly configured; urlencoded parser uses library defaults; multipart text field defaults must be confirmed for installed Multer/Busboy. Annotation count capped at 1,000, but several invalid-body paths occur after file upload. | `server/src/index.ts`, `routes/pages.ts`, `routes/edit.ts` |
| Quota/rate limit | Default 3 documents/day using signed cookie + per-process IP Map. No general requests/second limiter found. Counts consumed before processing; in-memory IP entries have no pruning. `trust proxy=1` requires verification against actual proxy chain. Never spoof IPs to evade quotas in tests. | `middleware/quota.ts`, `server/src/index.ts` |
| Persistent data | JSON files in project `data/` for users/entitlements and other state; no SQL connection pool. Paid requests read entitlements and increment usage with whole-file read/modify/write. Locks are per process, writes not atomic replacements. Multiple instances could race; parse/read errors become empty objects. Do not scale PM2 blindly. | `services/entitlements.ts`, `services/users.ts` |
| Timeouts | Office 180 s **per attempt**, up to four distinct attempts, plus unlimited queue wait. OCR language lookup 15 s; OCR commands 120 s each, repeated per page. qpdf 60 s. No whole-job deadline or request-disconnect cancellation found. HTTP/proxy timeouts unverified. | `services/office.ts`, `services/ocr.ts`, `services/unlock.ts`, `index.ts` |
| Temporary locations | Project `temp/` for uploads/results. `os.tmpdir()` folders prefixed `pdfone-lo-out-`, `pdfone-lo-profile-`, `pdfone-ocr-`, `pdfone-ocr-layout-`, `pdfone-html-`, `pdfone-unlock-`. Effective OS temp root is unknown. | `utils/temp.ts`, native services, `routes/extras.ts` |
| Normal cleanup | Most routes unlink upload in `finally`; `/temp/:name` deletes after successful download; edit downloads directly and deletes in its callback. Native working directories removed in `finally`. | `utils/temp.ts`, `index.ts`, routes/services |
| Expiry cleanup | Source default TTL 15 min, minimum 1 min, sweep every 5 min and at startup. Environment may override. Sweep visits only top-level non-hidden files in project `temp/`, not native temporary directories. README/AGENTS mention 2 h and are stale about several features. | `utils/temp.ts`, README, AGENTS |
| Failure cleanup risk | In page routes, JSON parsing or early invalid-annotation returns can bypass `handlePageTool` and its upload cleanup. Those files may wait for TTL. Crashes can skip native `finally` cleanup; no persistent native-folder scavenger found. Expiry sweep does not track in-flight/queued uploads, risking deletion of old active input. | `routes/pages.ts`, `utils/temp.ts`, native services |
| PDF.js cleanup compatibility | Installed PDF.js exposes destruction on the loading task; offline verification found document `destroy()` absent. Application raster helper calls optional document `destroy?.()`; inspect actual retained resources during endurance. This is a code-level risk, not an observed production leak. | `utils/rasterize.ts`, installed `pdfjs-dist`, offline fixture verification |

## Tool inventory and resource classification

Classification is a **source-based hypothesis**, not a measured ranking. A = lightweight, B = medium CPU, C = heavy CPU, D = heavy RAM, E = heavy disk I/O, F = external service/AI dependent. All uploads write to disk; E emphasizes tools with substantial additional temporary/output I/O. Large documents can move B tools into C/D.

| User tool | Endpoint / suite case | Classes | Main behavior |
|---|---|---|---|
| Homepage / API health | `/`, `/health` | A | Separate static/proxy and Node baseline |
| Upload | `upload-inspect` → `/api/pages/form-inspect` | B,D,E | Proxy for upload + parse, **not pure upload timing** |
| Merge | `/api/merge` | B,D,E | Whole PDFs and merged output in RAM |
| Split / extract pages | `/api/split`, `/api/pages/extract` | B,D,E | Selected-page copy; separate mode creates ZIP |
| Compress | `/api/compress` | C,D,E | Rasterize + JPEG encode + reassemble |
| Rotate | `/api/pages/rotate` | B,D | Parse/save whole document |
| Protect | `/api/protect` | B,C,D | Encryption + full serialization |
| Unlock | `/api/unlock` | B–C,D,E | Decrypt; qpdf then raster fallback |
| PDF to JPG | `/api/to-jpg` | C,D,E | All-page raster, JPEG, optional ZIP |
| PDF to PNG | `/api/to-png` | C,D,E | All-page raster, PNG, optional ZIP |
| JPG / PNG / images to PDF | `/api/jpg-to-pdf` | B,D,E | Common backend; independent JPG/PNG/WebP cases |
| HEIC to PDF | `/api/jpg-to-pdf` | C,D,E | Native conversion/heic-convert fallback; codec fixture prerequisite |
| PDF to Word | `/api/office/pdf-to-word` | C,D,E | Serialized LibreOffice import/export |
| Word to PDF | `/api/office/word-to-pdf` | C,D,E | Serialized LibreOffice |
| PDF to Excel | `/api/office/pdf-to-excel` | B,D | PDF text rows → XLSX locally; no LibreOffice |
| Excel to PDF | `/api/office/excel-to-pdf` | C,D,E | Serialized LibreOffice |
| PDF to PowerPoint | `/api/office/pdf-to-ppt` | C,D,E | Serialized LibreOffice |
| PowerPoint to PDF | `/api/office/ppt-to-pdf` | C,D,E | Serialized LibreOffice |
| HTML to PDF | `/api/html-to-pdf`, `/api/office/html-to-pdf` | C,D,E; conditional F | Only fixture HTML without external references allowed |
| OCR | `/api/ocr` | C,D,E | Raster + serialized local Tesseract; no AI API |
| Fill & Sign | `/api/pages/fill-sign` | B,D | Forms, text and drawn signature; browser preview also uses client CPU |
| Edit PDF | `/api/edit` | B,D | Direct binary response; annotations |
| Digital sign | `/api/pages/sign` | C initially,B–C,D | Local certificate/key generation cached per process, then signing; no external TSA found |
| Delete pages | `/api/pages/delete` | B,D | Rebuild remaining pages |
| Reorder pages | `/api/pages/reorder` | B,D | Copy pages in requested order |
| Crop | `/api/pages/crop` | B,D | Page boxes + serialization |
| Watermark | `/api/pages/watermark` | B,D | Text drawing, including mosaic option |
| Page numbers | `/api/pages/numbers` | B,D | Draw on pages |
| Header/footer | `/api/pages/header-footer` | B,D | Draw on pages |
| Extract images | `/api/pages/extract-images` | C,D,E | Decode embedded streams; possible image encode/ZIP |
| Flatten | `/api/pages/flatten` | B,D | AcroForm flatten/save |
| Fill form | `/api/pages/form-fill` | B,D | Inspect, fill, optional flatten |
| PDF to text | `/api/to-text` | B,D | PDF.js text extraction |
| Summarize | `/api/summarize` | F, optionally B locally | Can call OpenAI; excluded entirely |
| Translate | `/api/translate` | F,C,D | Can call OpenAI and MyMemory; layout/OCR fallback; excluded entirely |

Account, billing, admin, analytics and editorial operations are outside the load allowlist. Aliases (e.g. PNG/images→PDF and PPTX paths) share implementations and must not inflate tool counts.

## Phase 2 — reproducible suite

Use the supplied Node 22+ runner with built-in fetch/FormData. k6 is not installed locally. This runner needs no new npm dependency or application instrumentation; generators use already-installed project libraries. It is a **closed-model active-user test**, not an open arrival-rate benchmark. Run it from a separate load-generator machine, not from the VPS under test. Record generator hardware and network bandwidth; reject measurements if generator CPU, RAM, network or event-loop lag limit the offered load.

Generated assets are synthetic only. Nominal sizes use decimal MB: 996,415; 4,977,667; 9,954,244; 24,884,247; 49,767,602 bytes, with 2/10/20/50/100 pages. Displayed RGB charts supply actual bytes, not padding. Additional text PDFs (2/20/100 pages), scans (2/10 pages), a form, a 1 MB encrypted PDF, JPG/PNG/WebP/HEIC, DOCX, CSV, ODP and self-contained HTML cover distinct code paths. Manifest records sizes/page counts/SHA-256. All 20 fixtures passed hash/structure checks; four PDF families rendered offline, and HEIC decoded through heic-convert. Generated encrypted bytes and native codec output can vary between runs; retain manifests and hashes rather than claiming byte-identical regeneration across library/platform versions.

Limitations: chart PDFs are unusually compressible and size correlates with page count; compare them with compact text and scan families. These fixtures cannot represent all customer document complexity. Initial Word/Excel/PowerPoint inputs cover DOCX/CSV/ODP; add complex synthetic tables, images and native XLSX/PPTX samples before claiming format-wide capacity. Do not reuse benchmark results for untested formats, large image dimensions or malformed/decompression-bomb inputs.

The runner uploads using audited field names, checks JSON success, downloads only the returned same-origin `/temp/` output and checks file magic/nonempty text. It never follows redirects or invokes AI/payment endpoints. Successful jobs include output delivery; otherwise the one-shot cleanup path would not be exercised. These checks are not semantic validation: at baseline also inspect page count, content, encryption, OCR text accuracy and Office file readability offline. Fill & Sign frontend rendering/interaction needs separate browser profiling; API timing cannot measure browser performance.

There is no standalone upload endpoint. `/api/pages/form-inspect` is explicitly an upload-and-inspect surrogate and cannot isolate disk-write time. Upload-only time, server processing time, true event-loop delay, queue wait/depth and live heap need existing server telemetry or separately approved instrumentation. Do not label client wall time as those metrics. `/health` latency is only a responsiveness proxy.

## Exact commands and approval boundary

Safe offline commands (executed during preparation except regeneration when unnecessary):

```sh
node capacity/generate-fixtures.mjs
sips -s format heic capacity/fixtures/image.png --out capacity/fixtures/image.heic
node capacity/register-heic.mjs
node capacity/verify-fixtures.mjs
node --test capacity/suite.test.mjs
node capacity/run-stage.mjs capacity/stage.example.json --dry-run
```

The HEIC conversion above uses macOS `sips`; it was generated locally from the synthetic PNG. On Linux, reuse the verified fixture bundle or supply a compatible local HEIC encoder, without fetching customer samples. Regenerating the main manifest requires re-registering HEIC. The runner refuses missing or modified fixtures.

Prepare a reviewed `capacity/stage.local.json` from `stage.example.json`: fill the real One2PDF origin, chosen case, VUs, file, runtime, SLO, unique results directory, monitoring file and authorized synthetic cookie file. Optional `fixtureOverrides` maps a case to another generated fixture (e.g. `{"ocr":"scan-10pages.pdf"}`); use compatible formats. Leave `approval:false` until explicit approval. Do not commit credentials or raw reports. `cookieFile` contains only the Cookie header value, chmod 0600; the runner never logs it. Do not create subscriptions, mint access cookies, rotate source IPs or relax production quotas. If no authorized test entitlement exists, processing load remains blocked; agree an isolated staging deployment/access setup separately.

Read-only monitoring command template, **not executed; target and service identity must be supplied and verified**:

```sh
mkdir -p capacity/results
ssh -T ONE2PDF_SSH_ALIAS 'python3 - --app ONE2PDF_PM2_APP --project /ABSOLUTE/ONE2PDF/DEPLOYMENT --temp-root /EFFECTIVE/OS/TEMP --seconds 7200' < capacity/monitor.py > capacity/results/monitor.jsonl
```

Run it in a separate terminal at least five minutes before load, and keep it running through recovery. Default PM2 home assumes the existing service user; pass `--pm2-home` only after verifying the actual location. This collector does not restart anything or open user files. It filters PM2 data internally and emits only aggregate resource counters, never complete PM2/env/argv. Confirm that One2PDF has a dedicated service UID; orphan-process attribution is ambiguous when other apps use the same UID. Confirm clock synchronization (<5 s skew), Linux `/proc` permissions, cgroup restrictions, effective temp root and collector overhead. The collector currently measures host memory/CPU, not cgroup percentages; **a container-limited deployment requires adapting the monitoring configuration/collector before any load**.

The following is the **only production load command**, to run only after approval of the concrete target/configuration and healthy monitoring:

```sh
node capacity/run-stage.mjs capacity/stage.local.json
```

Every command runs **one bounded stage**. Nothing launches the next stage automatically. Repeated runs require new result directories. Ctrl-C stops the generator; it does not kill Node/LibreOffice or cancel already-running server jobs. Continue monitoring and wait for pending work to drain. Never restart/kill production processes to force recovery.

## Phases 3–6 — proposed execution

1. **Preflight:** complete VPS audit; agree maintenance window, representative fixture distribution, synthetic access, deployment identity, budgets and SLOs. Validate collector on idle host for five minutes. One valid operation/tool at VU=1, including download and semantic validation. Large fixtures must pass a separate one-user baseline before concurrency increases. Do not exercise all 50 MB heavy jobs simultaneously.
2. **Individual load:** lightweight HTTP 1→5→10→20→30→50→75→100 active users, starting 60 s then 3–5 min/stage. PDF manipulation 1→2→3→5→8→10, increasing only with resource/latency headroom. Raster/compression/OCR/Office start 1→2→3; any higher stage needs affirmative review of the previous measurements. A serial Office/OCR queue can increase latency without higher throughput; don't treat more waiting requests as greater useful capacity. Use 2–5 s user think time and report it. A separate HTTP-only no-think calibration may later measure maximal request throughput; label it separately.
3. **Stage gate:** no stop condition; ≥20 completed samples for a provisional p95 check; ≥1,000 samples for a credible p99 tail estimate, otherwise mark low confidence. Observe drain and at least 60 s recovery before the next stage. Compare to the no-load baseline; account for unrelated VPS activity. Repeat only measurements needed to resolve noise. Failed/admission-limited jobs must be counted, not discarded.
4. **Mixed load:** 60% light (30% homepage + 30% health), 15% medium compression, 8% merge, 5% split, 4% PDF→JPG, 3% images→PDF, 2% Office (1% each direction), 2% OCR, 1% Fill & Sign. Case `mixed` uses a deterministic weighted schedule. Shares are intended **operation counts**, not simultaneous worker occupancy; report observed shares. Test 10→25→50→100 only if individual results justify each stage; start below 10 if needed. Small-stage empirical proportions may differ. Set per-tool SLOs in `p95ByTool`; a global mixed percentile alone hides slow heavy tools.
5. **Endurance:** choose 60–70% of the highest stable mixed active-user concurrency (never of an HTTP-only peak). One 1,800–3,600 s stage with the identical think time and fixture mix. Track per-tool throughput/latency plus RSS trend, swap, I/O, PM2, native children, temporary files. Run at least 30 min after warmup; cold signing initialization is a separate result. More than one run may be needed to distinguish native allocator retention from a leak.
6. **Recovery:** five to ten minutes without job submissions; compare CPU, RSS, swap, disk, PM2, native children and health latency to baseline. Wait longer for timed-out/queued work. For unclaimed outputs, also observe for **effective TTL + a full sweep interval**: default up to 20 min, or >2 h if deployment overrides TTL. A 10-min recovery window alone cannot prove expiry cleanup. Check only this run's known synthetic files; do not list/download/delete customer files. No new stage until the pending work is known to have drained. There is no queue introspection API in this checkout, so absence of blocked work cannot be conclusively established from health alone.

One-at-a-time, small synthetic validation failures and one abandoned output should exercise failed-job/TTL cleanup after functional success, outside throughput measurements. Suggested cases: wrong password on the generated encrypted document, invalid page-selection JSON after a small upload, invalid annotation count, one successful output intentionally not downloaded. No crash, OOM, process-kill, disk-fill, corrupt archive, adversarial parser or unbounded disconnect campaign. This suite does not automatically run failure injections or abandoned-output scenarios; review those exact one-shot requests before adding them.

## Monitoring, automatic stops and risk

Collector every 5 s; supervisor checks every 1 s. Logs: aggregate `monitor.jsonl`, per-operation `observations.jsonl`, reviewed `plan.json`, `summary.json`. Record HTTP requests/min separately from successful document jobs/min: one normal PDF operation involves a POST and GET, while edit returns a binary directly. Job latency includes upload + wait + processing + output download; report API and download components separately. Percentiles include failures and additionally expose success-only p95. No bodies, user identifiers, credentials or service errors are recorded.

| Automatic stop | Initial proposed setting |
|---|---|
| CPU saturation | >90% continuously for 30 s; baseline must be ≤75% |
| RAM | >90% using MemAvailable; baseline ≤80% |
| Swap | >64 MB increase in used swap or cumulative swap-out since stage baseline (conservative) |
| Disk | <15% free or <5 GiB on either project/temp filesystem |
| Temporary growth | >1 GiB or >1,000 files over baseline; bounded collector scan |
| Errors | >5% of ≥20 completed operations in trailing 30 s; or three consecutive failed operations |
| Repeated 5xx | Three consecutive processing responses; download failures also fail the operation |
| Access/rate control | Immediate stop on 401/402/403/429 |
| Latency | Rolling per-tool p95 above approved SLO, after 20 samples |
| PM2 / OOM | Any restart-counter change, non-online instance, or additional host OOM kill |
| Native processes | Initial 2 LO-related / 1 Tesseract; calibrate observed wrapper count per audited instance; any zombie increase or child age >240 s |
| Monitor failure | Missing/unreadable, invalid or >15 s old telemetry; excessive clock skew |

Provisional SLOs: light HTTP p95 ≤500 ms, standard PDF ≤10 s, heavy raster/Office/OCR ≤60 s for the small baseline fixtures. These are acceptance criteria for approval, **not observed performance**. Initial client timeout 65 s may expire before native deadlines; treat that as a failed job and stop/recover, not cancellation. Loosen an SLO only through an explicit fixture-specific decision, not simply to let a failing stage pass. Long documents require their own duration/age budgets and cannot inherit the small-document SLO.

Host disk counters include bytes, I/O time and weighted I/O time per device; derive rates/utilization from consecutive samples, do not sum partitions and parents. Process RSS includes Node; monitor separate native process count and host RAM to catch child allocations. No DB connection pool exists in audited source. Persistent JSON consistency and true event-loop/heap/queue metrics are not instrumented by this collector: an approved privacy-preserving in-process/OS observer is a prerequisite if those exact metrics are required. Do not claim their automatic detection from host metrics. Runtime I/O faults may surface as operation failures, but silent JSON parse/write corruption could be missed; multi-instance paid-state testing needs particular care.

Estimated risk: offline fixture generation **low**; single-user production baseline **low to moderate**; concurrent raster/Office/OCR and endurance **moderate to high until VPS resources are verified**. Automatic stops reduce ongoing submissions but cannot retract already-queued work or guarantee zero customer impact. Therefore a destructive breaking-point search is out of scope: report the first safety/SLO boundary, not intentionally crash the VPS. No significant production load is authorized yet.

## Capacity report to complete after approved execution

| Requested result | Current status |
|---|---|
| VPS CPU / RAM / swap / disk / PM2 | Unverified |
| Sustainable light HTTP requests/min | Not measured |
| Safe concurrent PDF users / PDF jobs per minute | Not measured |
| Recommended sustained concurrency | Not measured |
| CPU/RAM saturation and I/O limits | Not measured |
| Observed safety boundary / error rate / p50 / p95 / p99 | Not measured |
| PM2/native-process stability, cleanup, leaks, recovery | Code risks identified; runtime not tested |
| Daily/monthly users, 10k/50k/100k monthly visitors | Cannot classify responsibly yet |

Per-tool report row: `tool | fixture/hash | bytes/pages/pixel dimensions | VUs/think time | duration/sample count | average | p50 | p95 | p99 | success jobs/min | CPU baseline/peak | RAM baseline/peak | I/O | errors | safe concurrency | confidence`. Do not average per-stage percentiles together; calculate from the relevant raw observations. Account for download bytes and load-generator capacity. Identify the top three **observed** bottlenecks; current hypotheses are raster CPU/RAM, serial Office/OCR waiting, and unbounded admission/temp + JSON I/O.

Forecast only after measuring mixed PDF capacity. If `J` = safe sustained jobs/min for the representative mix, `f` = fraction of visitors processing PDFs, `d` = jobs per processing visitor, `H` = busy hours/day, `P` = peak/average arrival factor, then a workload-constrained estimate is `visitors/day ≈ J × 60 × H / (f × d × P)`, further bounded by measured HTTP and bandwidth capacity and separately by the slow Office/OCR lane. State assumptions/ranges, conversion mix, document sizes and bursts explicitly; monthly≈30×daily is only a scenario estimate. For monthly traffic M, evaluate peak PDF arrivals `M × f × d × P / (30 × 60 × H)` **and each tool share** against tested capacity. Ten thousand visitors/month is not automatically trivial if a large fraction submit lengthy OCR/Office jobs in bursts.

## Optimization proposals — not implemented

**P0 before traffic growth:** bounded global job admission with resource budgets and backpressure; whole-job deadlines/cancellation-aware native process handling; reliable finally/TTL cleanup including native folders and active-job awareness; verify PDF.js destruction compatibility; fix multi-process JSON persistence before increasing PM2 instances, with atomic/transactional durable state; enforce pre-write size/aggregate upload limits and validate disk headroom. Treat confirmed correctness faults such as the compression preset separately from benchmark tuning.

**P1:** isolate CPU-heavy work from HTTP/event loop; bound raster memory by processing/releasing pages incrementally; measure and tune native worker concurrency against CPU/RAM; add queue wait/depth, event-loop delay, heap/native RSS and per-tool metrics without user content; align reverse-proxy and job deadlines; benchmark realistic high-resolution images and documents; prune quota memory and introduce appropriate request admission controls.

**P2:** separate API/worker scaling and queues by resource class, durable shared state, shared/object result storage with lifecycle cleanup, independent OCR/Office pools, horizontal workers and traffic-based capacity planning. Roll out only after measurements justify the operational complexity.

**Stop here before Phase 3.** Complete the missing VPS audit and test-access prerequisites, show the concrete target/config and any revised thresholds, and obtain explicit approval before sending significant production traffic.

## Preparation validation

Passed: 20 fixture hashes/sizes/container checks and PDF page counts; four PDF-family render checks with installed PDF.js; HEIC decode; three Node test groups covering resource guards, case allowlist/payloads and mocked runner behavior (approval, stale monitoring, successful download, repeated 5xx); runner dry-run; Node/Python syntax checks. Mock results were discarded and are never capacity evidence. The Linux collector has only been syntax-checked locally and must be exercised read-only on the actual VPS before approval. No One2PDF runtime, Office conversion or real OCR execution has yet been benchmarked.
