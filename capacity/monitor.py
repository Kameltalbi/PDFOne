#!/usr/bin/env python3
"""Read-only Linux/PM2 collector. Emits aggregate metrics; never emits env, argv or data filenames.
Run via SSH stdin using the existing One2PDF service user, not root. Does not start PM2.
"""
import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import time

parser = argparse.ArgumentParser()
parser.add_argument('--app', required=True, help='Exact existing PM2 app name')
parser.add_argument('--project', required=True, help='Absolute deployed One2PDF root')
parser.add_argument('--temp-root', default='/tmp', help='Effective os.tmpdir() on server')
parser.add_argument('--pm2-home', default=str(Path.home() / '.pm2'))
parser.add_argument('--seconds', type=int, default=3600)
args = parser.parse_args()
project = Path(args.project).resolve()
if not (project / 'server').is_dir() or not (project / 'temp').is_dir():
    raise SystemExit('Expected deployed One2PDF server and temp directories')
if not Path('/proc/stat').exists():
    raise SystemExit('Linux collector only; local macOS is not the VPS')

def counters(filename):
    values = {}
    for line in Path(filename).read_text().splitlines():
        parts = line.replace(':', '').split()
        if len(parts) >= 2:
            try:
                values[parts[0]] = int(parts[1])
            except ValueError:
                pass
    return values

def pm2():
    # A bare `pm2 jlist` can auto-start a daemon. Check the existing daemon first.
    pid = int((Path(args.pm2_home) / 'pm2.pid').read_text().strip())
    os.kill(pid, 0)
    env = dict(os.environ, PM2_HOME=args.pm2_home)
    result = subprocess.run(['pm2', 'jlist'], capture_output=True, text=True, timeout=4, check=True, env=env)
    # Full jlist is held in memory only; no stdout/stderr passthrough or exception detail.
    entries = [p for p in json.loads(result.stdout) if p.get('name') == args.app]
    if not entries:
        raise ValueError('No matching app')
    for p in entries:
        executable = Path(p.get('pm2_env', {}).get('pm_exec_path', '')).resolve()
        if project not in executable.parents:
            raise ValueError('App outside project')
    return entries

def processes(root_pids):
    table = {}
    for directory in Path('/proc').iterdir():
        if not directory.name.isdigit():
            continue
        try:
            raw = (directory / 'stat').read_text()
            rest = raw[raw.rfind(')') + 2:].split()
            table[int(directory.name)] = (int(rest[1]), rest[0], (directory / 'comm').read_text().strip(), int(rest[19]), directory)
        except (FileNotFoundError, ProcessLookupError):
            continue
        except PermissionError:
            continue
    selected = set(root_pids)
    while True:
        added = {pid for pid, row in table.items() if row[0] in selected} - selected
        if not added:
            break
        selected |= added
    lo = ocr = zombies = rss = read_bytes = write_bytes = 0
    oldest = 0
    uptime = float(Path('/proc/uptime').read_text().split()[0])
    ticks = os.sysconf('SC_CLK_TCK')
    for pid in selected:
        if pid not in table:
            continue
        _, state, comm, started, directory = table[pid]
        is_lo = 'soffice' in comm or 'libreoffice' in comm
        is_ocr = 'tesseract' in comm
        lo += is_lo
        ocr += is_ocr
        zombies += state == 'Z'
        if is_lo or is_ocr:
            oldest = max(oldest, uptime - started / ticks)
        try:
            if pid in root_pids:
                rss += counters(directory / 'status').get('VmRSS', 0) * 1024
            io = counters(directory / 'io')
            read_bytes += io.get('read_bytes', 0)
            write_bytes += io.get('write_bytes', 0)
        except (FileNotFoundError, ProcessLookupError):
            pass
    # Also count reparented binaries owned by the One2PDF service user.
    # Other apps sharing that UID must be ruled out during the audit.
    orphan_lo = orphan_ocr = 0
    for pid, (ppid, state, comm, started, directory) in table.items():
        if pid in selected or ppid != 1:
            continue
        try:
            if directory.stat().st_uid == os.getuid():
                is_lo = 'soffice' in comm or 'libreoffice' in comm
                is_ocr = 'tesseract' in comm
                orphan_lo += is_lo
                orphan_ocr += is_ocr
                if is_lo or is_ocr:
                    oldest = max(oldest, uptime - started / ticks)
                    zombies += state == 'Z'
        except FileNotFoundError:
            pass
    return dict(loCount=lo + orphan_lo, ocrCount=ocr + orphan_ocr, orphanLo=orphan_lo, orphanOcr=orphan_ocr,
                zombies=zombies, nodeRssBytes=rss, processReadBytes=read_bytes, processWriteBytes=write_bytes,
                oldestChildSeconds=oldest)

def temporary():
    roots = [project / 'temp']
    prefixes = ('pdfone-lo-out-', 'pdfone-lo-profile-', 'pdfone-ocr-', 'pdfone-ocr-layout-', 'pdfone-html-', 'pdfone-unlock-')
    roots += [p for p in Path(args.temp_root).iterdir() if p.name.startswith(prefixes) and p.is_dir() and not p.is_symlink()]
    count = size = 0
    for root in roots:
        for directory, _, files in os.walk(root, followlinks=False):
            for name in files:
                p = Path(directory) / name
                try:
                    if not p.is_symlink():
                        stat = p.stat()
                        count += 1
                        size += stat.st_size
                except FileNotFoundError:
                    pass
                if count > 20000:
                    raise ValueError('Temporary scan budget exceeded')
    return count, size

def cpu():
    return list(map(int, Path('/proc/stat').read_text().splitlines()[0].split()[1:9]))

def diskstats():
    result = {}
    for line in Path('/proc/diskstats').read_text().splitlines():
        p = line.split()
        if len(p) >= 14 and not p[2].startswith(('loop', 'ram')):
            result[p[2]] = dict(readBytes=int(p[5]) * 512, writeBytes=int(p[9]) * 512, ioMs=int(p[12]), weightedIoMs=int(p[13]))
    return result

previous = cpu()
end = time.monotonic() + args.seconds
while time.monotonic() < end:
    time.sleep(5)
    try:
        current = cpu()
        delta = sum(current) - sum(previous)
        busy = 100 * (delta - (current[3] - previous[3]) - (current[4] - previous[4])) / max(1, delta)
        iowait = 100 * (current[4] - previous[4]) / max(1, delta)
        previous = current
        mem = counters('/proc/meminfo')
        vm = counters('/proc/vmstat')
        entries = pm2()
        roots = {p['pid'] for p in entries if p.get('pid', 0) > 0}
        files, size = temporary()
        disks = [shutil.disk_usage(project), shutil.disk_usage(args.temp_root)]
        row = dict(timestamp=int(time.time() * 1000), ok=True,
                   cpuPct=busy, ioWaitPct=iowait, cpuCores=os.cpu_count(), ramTotalBytes=mem['MemTotal'] * 1024,
                   ramPct=100 * (1 - mem['MemAvailable'] / mem['MemTotal']),
                   swapBytes=(mem['SwapTotal'] - mem['SwapFree']) * 1024,
                   swapOutBytes=vm['pswpout'] * os.sysconf('SC_PAGE_SIZE'),
                   diskFreeBytes=min(d.free for d in disks), diskFreePct=min(100 * d.free / d.total for d in disks),
                   tempFiles=files, tempBytes=size, oomKills=vm['oom_kill'],
                   restarts=sum(p.get('pm2_env', {}).get('restart_time', 0) for p in entries),
                   instances=len(entries), online=all(p.get('pm2_env', {}).get('status') == 'online' for p in entries),
                   diskCounters=diskstats(), **processes(roots))
        print(json.dumps(row), flush=True)
    except Exception:
        print(json.dumps(dict(timestamp=int(time.time() * 1000), ok=False, reason='collector failed; no private details emitted')), flush=True)
        raise SystemExit(2)
