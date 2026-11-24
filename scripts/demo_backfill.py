"""Fill a releases folder: Releases\\v<version>\\ per version with notes, screenshot and video.

    python scripts/demo_backfill.py --home <releases folder> [--only 0.58.3 0.58.2] [--limit 10] [--jobs 2]

Every tagged version gets release_notes.md (its date and what changed, from its commits),
then a screenshot and video made by scripts/demo_capture.py from that version's own code
with the made-up demo data. A version that can't be built or run gets a line in its notes
saying why instead. A couple at a time (--jobs), to stay easy on the machine.

Locotoko's tags: from 0.25.14 to 0.43.x most versions carry two tags, "v0.26.10" (the
version bump) and "0.26.10" (deploy.sh's commit right after it, which also bumped the
client's package.json). That's one version: its folder is v0.26.10, built from the later
commit, the one deploy.sh built and shipped.
"""

from __future__ import annotations

import argparse
import io
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
import threading
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CAPTURE = REPO / "scripts" / "demo_capture.py"
NOTE = "Not captured:"
EXTRA = REPO / "demo" / "release_notes"     # hand-written notes for a version, used instead of commits
PRINT = threading.Lock()


def git(*args: str, binary: bool = False):
    p = subprocess.run(["git", "-C", str(REPO), *args], capture_output=True, check=True,
                       **({} if binary else {"text": True, "encoding": "utf-8"}))
    return p.stdout


def key(v: str) -> tuple[int, ...]:
    return tuple(int(x) for x in v.split("."))


def versions() -> list[tuple[str, str]]:
    """(version, the tag to build), oldest first; a version with two tags uses the later commit."""
    by: dict[str, list[str]] = {}
    for tag in git("tag").split():
        if re.fullmatch(r"v?\d+\.\d+\.\d+", tag):
            by.setdefault(tag.lstrip("v"), []).append(tag)
    out = []
    for v in sorted(by, key=key):
        tags = by[v]
        if len(tags) > 1:
            a, b = tags[0], tags[1]
            # the descendant is the later one
            later = b if subprocess.run(["git", "-C", str(REPO), "merge-base", "--is-ancestor", a, b]).returncode == 0 else a
            out.append((v, later))
        else:
            out.append((v, tags[0]))
    return out


SKIP = re.compile(r"^(Merge |Updated version to |v?\d+\.\d+\.\d+$|Bump version)", re.I)


def release_notes(version: str, tag: str, prev: str | None, prev_version: str | None) -> str:
    day = git("log", "-1", "--format=%ad", "--date=short", tag).strip()
    head = f"# Locotoko v{version}\n\nReleased {day}.\n\n"
    extra = EXTRA / f"v{version}.md"
    if extra.exists():
        return head + extra.read_text(encoding="utf-8").strip() + "\n"
    raw = git("log", "--reverse", "--format=%x1e%s%x1f%b", f"{prev}..{tag}" if prev else tag)
    bullets: list[str] = []
    for rec in raw.split("\x1e"):
        if not rec.strip():
            continue
        subj, _, body = rec.partition("\x1f")
        subj = subj.strip()
        if SKIP.match(subj):
            continue
        subj = re.sub(r"\s*\(#\d+\)$", "", subj)
        line = subj[:1].upper() + subj[1:]
        bullets.append(f"- {line}" + ("" if line.endswith((".", "!", "?")) else "."))
        for bl in body.splitlines():
            s = bl.strip()
            if s.startswith(("- ", "* ")) and not s.lower().startswith(("- co-authored", "* co-authored")):
                bullets.append("  - " + s[2:].strip())
    if prev is None:
        n = sum(1 for b in bullets if b.startswith("- "))
        intro = (f"The first tagged version. Versions 0.1.0 to 0.11.5 were never tagged in git, so they have no "
                 f"folders; everything built since the first commit (April 2022) is listed here, {n} commits.\n\n")
        return head + intro + "\n".join(bullets) + "\n"
    if not bullets:
        bullets = [f"- No changes beyond the version number (the same code as v{prev_version})."]
    return head + "\n".join(bullets) + "\n"


def update_readme(home: Path, every: list[tuple[str, str]]) -> None:
    readme = home / "README.md"
    if not readme.exists() or not every:
        return
    text = readme.read_text(encoding="utf-8")
    text = re.sub(r"(?m)^version: .*$", f"version: {every[-1][0]}", text, count=1)
    newest = next((v for v, _ in reversed(every)
                   if (home / "Releases" / f"v{v}" / "Screenshots" / f"Locotoko v{v}.png").exists()), None)
    if newest:
        image = f"![Locotoko v{newest}](Releases/v{newest}/Screenshots/Locotoko%20v{newest}.png)"
        text = re.sub(r"(?m)^(!\[Locotoko v[^\]]*\]\([^)]*\)|_The screenshot of the newest version goes here.*_)$",
                      image, text, count=1)
    readme.write_text(text, encoding="utf-8", newline="\n")


def export(tag: str, dest: Path) -> None:
    with tarfile.open(fileobj=io.BytesIO(git("archive", "--format=tar", tag, binary=True))) as tar:
        tar.extractall(dest, filter="data")


def say(msg: str) -> None:
    with PRINT:
        print(msg, flush=True)


def one(home: Path, version: str, tag: str, work: Path) -> None:
    rel = home / "Releases" / f"v{version}"
    notes = rel / "release_notes.md"
    shots, videos = rel / "Screenshots", rel / "Videos"
    name = f"Locotoko v{version}"
    with tempfile.TemporaryDirectory(prefix=f"loco-{version}-", dir=work) as tmp:
        code, out = Path(tmp) / "code", Path(tmp) / "out"
        export(tag, code)
        try:
            run = subprocess.run([sys.executable, str(CAPTURE), "--code", str(code), "--out", str(out),
                                  "--version", version], capture_output=True, text=True, encoding="utf-8",
                                 errors="replace", timeout=5400)
            lines = (run.stdout + run.stderr).strip().splitlines()
            ok = run.returncode == 0
        except subprocess.TimeoutExpired:
            lines, ok = ["CANNOT: it didn't finish within 90 minutes"], False
        png, mp4 = out / f"{name}.png", out / f"{name}.mp4"
        text = notes.read_text(encoding="utf-8")
        if ok and png.exists() and mp4.exists():
            shots.mkdir(parents=True, exist_ok=True)
            videos.mkdir(parents=True, exist_ok=True)
            shutil.move(str(png), shots / png.name)
            shutil.move(str(mp4), videos / mp4.name)
            if NOTE in text:
                text = "\n".join(l for l in text.splitlines() if not l.startswith(f"- {NOTE}")) + "\n"
                notes.write_text(text, encoding="utf-8", newline="\n")
            say(f"ok   v{version}")
        else:
            reason = next((l[len("CANNOT: "):] for l in reversed(lines) if l.startswith("CANNOT: ")),
                          lines[-1] if lines else "no output")
            text = "\n".join(l for l in text.splitlines() if not l.startswith(f"- {NOTE}")).rstrip("\n")
            notes.write_text(text + f"\n- {NOTE} this version couldn't be run with the demo data "
                             f"({reason.strip()[:300]}), so it has no screenshot or video.\n",
                             encoding="utf-8", newline="\n")
            say(f"FAIL v{version}: {reason}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--home", type=Path, required=True)
    ap.add_argument("--only", nargs="*")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--jobs", type=int, default=2)
    ap.add_argument("--retry", action="store_true", help="also try versions marked as not captured")
    ap.add_argument("--notes", action="store_true", help="rewrite every release_notes.md (keeps 'Not captured' lines)")
    ap.add_argument("--work", type=Path, default=Path(tempfile.gettempdir()))
    args = ap.parse_args()
    every = versions()
    todo = []
    for i, (version, tag) in enumerate(every):
        if args.only and version not in [o.lstrip("v") for o in args.only]:
            continue
        rel = args.home / "Releases" / f"v{version}"
        notes = rel / "release_notes.md"
        prev = every[i - 1] if i else (None, None)
        if not notes.exists() or args.notes:
            old = notes.read_text(encoding="utf-8") if notes.exists() else ""
            keep = [l for l in old.splitlines() if l.startswith(f"- {NOTE}")]
            rel.mkdir(parents=True, exist_ok=True)
            fresh = release_notes(version, tag, prev[1], prev[0])
            notes.write_text(fresh.rstrip("\n") + ("\n" + "\n".join(keep) if keep else "") + "\n",
                             encoding="utf-8", newline="\n")
        name = f"Locotoko v{version}"
        if (rel / "Screenshots" / f"{name}.png").exists() and (rel / "Videos" / f"{name}.mp4").exists():
            continue
        if NOTE in notes.read_text(encoding="utf-8") and not args.retry:
            continue
        todo.append((version, tag))
    if args.limit:
        todo = todo[:args.limit]
    say(f"{len(todo)} to capture")
    args.work.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=max(1, args.jobs)) as pool:
        for f in [pool.submit(one, args.home, v, t, args.work) for v, t in todo]:
            f.result()
    update_readme(args.home, every)


if __name__ == "__main__":
    main()
