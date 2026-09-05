# One2PDF capacity testing

Start with [the audit and approval packet](AUDIT-AND-PLAN.md). Production load is disabled and VPS authentication is unresolved. Application source is unchanged.

Files:

- `generate-fixtures.mjs`: offline synthetic PDFs, images and Office files.
- `register-heic.mjs`: records the locally converted synthetic HEIC in the manifest.
- `verify-fixtures.mjs`: validates hashes, PDF page counts/rendering and HEIC decoding.
- `cases.mjs`: explicit local-processing endpoint/payload allowlist and resource guard.
- `run-stage.mjs`: one monitored, bounded active-user stage; never auto-escalates concurrency.
- `monitor.py`: read-only Linux/PM2 aggregate collector; no env/argv/customer-file output.
- `stage.example.json`: reviewable configuration, `approval:false` by default.
- `suite.test.mjs`: offline safety/runner checks with mocked fetch, no network.
- `fixtures/manifest.json`: generated input sizes, hashes and page counts; fixtures are ignored by git.

Review without sending traffic:

```sh
node capacity/run-stage.mjs capacity/stage.example.json --dry-run
node --test capacity/suite.test.mjs
```

No capacity figures are available yet. See the approval packet for monitoring, exact future load command, access/quota prerequisites, stage gates, endurance, recovery and reporting limits.
