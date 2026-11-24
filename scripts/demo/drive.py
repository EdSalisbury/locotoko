"""Walk through one Locotoko version in Chromium: a screenshot of the item list and a short video.

Runs inside the locotoko-demo-browser container on the capture's own internal Docker
network (no way out to the internet), started by scripts/demo_capture.py:

    python drive.py --base http://app:3333 --out /out --name "Locotoko v0.58.3" --routes /items /owners ...

With --static <dir>, the client is served from that folder on localhost:8080 (versions whose
server didn't serve it yet) and the API stays at --api. Every request that isn't for the app
itself is refused, so nothing outside the capture is ever reached.

Exit code 0 when both files were written; 2 with "CANNOT: <reason>" as the last line otherwise.
"""

from __future__ import annotations

import argparse
import functools
import http.server
import json
import os
import shutil
import threading
import time
from pathlib import Path
from urllib.parse import urlparse

VIEW = {"width": 1440, "height": 900}
ALLOWED = {"app", "localhost", "127.0.0.1"}


def fail(reason: str) -> None:
    print(f"CANNOT: {reason}", flush=True)
    os._exit(2)


class SpaHandler(http.server.SimpleHTTPRequestHandler):
    """Static files, with index.html for any path that isn't a file (the router's history mode)."""

    def send_head(self):
        path = Path(self.translate_path(self.path))
        if not path.exists():
            self.path = "/index.html"
        return super().send_head()

    def log_message(self, *args):
        pass


def serve_static(folder: str) -> str:
    handler = functools.partial(SpaHandler, directory=folder)
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 8080), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return "http://localhost:8080"


def settle(page, seconds: float) -> None:
    try:
        page.wait_for_load_state("networkidle", timeout=5000)
    except Exception:
        pass
    page.wait_for_timeout(int(seconds * 1000))


def glide(page, seconds: float) -> None:
    """Scroll down the page and back up over about `seconds`."""
    height = page.evaluate("document.body.scrollHeight") or 0
    room = max(0, height - VIEW["height"])
    steps = 12
    if room < 40:
        page.wait_for_timeout(int(seconds * 1000))
        return
    pause = int(seconds * 1000 / (2 * steps))
    for i in range(1, steps + 1):
        page.evaluate(f"window.scrollTo({{top: {room * i / steps}, behavior: 'smooth'}})")
        page.wait_for_timeout(pause)
    for i in range(steps - 1, -1, -1):
        page.evaluate(f"window.scrollTo({{top: {room * i / steps}, behavior: 'smooth'}})")
        page.wait_for_timeout(pause)


def list_shown(page, expect: list[str], timeout: int) -> bool:
    """Whether the page shows one of the demo items' titles within `timeout` ms."""
    try:
        page.wait_for_function("ts => ts.some(t => document.body.innerText.toLowerCase().includes(t))",
                               arg=[e.lower() for e in expect], timeout=timeout)
        page.wait_for_timeout(1500)
        return True
    except Exception:
        return False


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="http://app:3333")
    ap.add_argument("--static")
    ap.add_argument("--out", required=True)
    ap.add_argument("--name", required=True)
    ap.add_argument("--email", required=True)
    ap.add_argument("--password", required=True)
    ap.add_argument("--item", required=True, help="id of the item to open")
    ap.add_argument("--template", required=True)
    ap.add_argument("--expect", nargs="+", required=True, help="texts the item list must show one of")
    ap.add_argument("--routes", nargs="*", default=[])
    args = ap.parse_args()

    from playwright.sync_api import sync_playwright

    base = serve_static(args.static) if args.static else args.base
    out = Path(args.out)
    video_dir = out / "video"
    video_dir.mkdir(parents=True, exist_ok=True)
    routes = set(args.routes)
    blocked: list[str] = []

    def guard(route):
        host = urlparse(route.request.url).hostname or ""
        if route.request.url.startswith("data:") or host in ALLOWED:
            route.continue_()
        else:
            blocked.append(host)
            route.abort()

    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport=VIEW, record_video_dir=str(video_dir), record_video_size=VIEW)
        ctx.route("**/*", guard)
        page = ctx.new_page()
        try:
            page.goto(base + "/login", timeout=30000)
            settle(page, 1.0)
            pw = page.locator("input[type=password]").first
            email = page.locator("input:not([type=password]):not([type=hidden]):not([type=checkbox])").first
            email.click()
            email.type(args.email, delay=45)
            pw.click()
            pw.type(args.password, delay=45)
            page.wait_for_timeout(400)
            pw.press("Enter")
            page.wait_for_timeout(2500)
            if "/login" in page.url:
                btn = page.locator("button[type=submit]").first
                if btn.count():
                    btn.click()
                    page.wait_for_timeout(2500)
        except Exception as e:  # noqa: BLE001
            fail(f"couldn't log in ({type(e).__name__}: {str(e).splitlines()[0][:120]})")

        tour = [("/", 4.0, False)]
        tour.append(("/items", 8.0, True))
        if "/viewItem/:id" in routes:
            tour.append((f"/viewItem/{args.item}", 10.0, True))
        if "/addItem" in routes:
            tour.append(("/addItem", 5.0, True))
        if "/templates" in routes:
            tour.append(("/templates", 4.0, False))
        if "/templates/:id" in routes:
            tour.append((f"/templates/{args.template}", 4.0, True))
        if "/acquisitions" in routes:
            tour.append(("/acquisitions", 4.0, False))
        if "/owners" in routes:
            tour.append(("/owners", 3.0, False))
        tour.append(("/items", 2.0, False))

        shot = out / f"{args.name}.png"
        for path, seconds, scroll in tour:
            try:
                page.goto(base + path, timeout=30000)
            except Exception as e:  # noqa: BLE001
                fail(f"couldn't open {path} ({str(e).splitlines()[0][:120]})")
            settle(page, 1.0)
            if path == "/items":
                if "/login" in page.url:
                    fail("the login with the demo user didn't take")
                shown = list_shown(page, args.expect, 15000 if not shot.exists() else 5000)
                if not shown:
                    # Some versions (0.31.x) filled the table only after a filter button was clicked
                    show_all = page.get_by_role("button", name="Show All")
                    if show_all.count():
                        show_all.first.click()
                        shown = list_shown(page, args.expect, 10000)
                if not shot.exists():
                    if not shown:
                        # The version runs, but its item list comes up empty (0.15.1-0.15.9 had a
                        # server filter that dropped every item): captured as it was, and said so.
                        print("EMPTY: the item list comes up empty in this version", flush=True)
                    page.screenshot(path=str(shot))
            if scroll:
                glide(page, seconds)
            else:
                page.wait_for_timeout(int(seconds * 1000))

        video = page.video
        ctx.close()
        browser.close()
        webm = Path(video.path()) if video else None
        if not webm or not webm.exists():
            fail("no video was recorded")
        shutil.move(str(webm), out / f"{args.name}.webm")
        shutil.rmtree(video_dir, ignore_errors=True)
    if blocked:
        print("blocked outside requests: " + json.dumps(sorted(set(blocked))), flush=True)
    print("ok", flush=True)


if __name__ == "__main__":
    main()
