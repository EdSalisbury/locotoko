"""Screenshot and video of one Locotoko version, built from its own code and run with made-up data.

    python scripts/demo_capture.py --code <export of any version> --out <folder> --version 0.58.3

Everything runs in Docker on this machine, never against the live store or its database:
  1. Builds that version's client and server in the Node image its own Dockerfile names,
     with node_modules kept in Docker volumes per lockfile (versions share them). Packages its
     lockfile doesn't pin resolve as they did on --date, its release day (scripts/demo/lockfix.js).
  2. Starts a throwaway Postgres and the server on an internal Docker network with no way
     out to the internet, applies that version's own migrations and fills the database
     with demo/data.json (an invented shop: people, titles and photos are all made up).
  3. Walks through the app in Chromium on the same network (scripts/demo/drive.py).
Writes "<out>/Locotoko v<version>.png" and ".mp4". Exit code 0 when both were written;
2 when the version can't be built, run or show the demo data, with "CANNOT: <reason>" last.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import time
import uuid
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DEMO = REPO / "demo"
BROWSER_IMAGE = "locotoko-demo-browser"
PG_IMAGE = "postgres:13"
LOCKS = Path(os.environ.get("TEMP", "/tmp")) / "locotoko-demo-locks"
ENV = {**os.environ, "MSYS_NO_PATHCONV": "1"}


def fail(reason: str) -> None:
    print(f"CANNOT: {reason}", flush=True)
    sys.exit(2)


def run(*args: str, check: bool = True, timeout: int = 1800, input: str | None = None) -> subprocess.CompletedProcess:
    p = subprocess.run(list(args), capture_output=True, text=True, encoding="utf-8", errors="replace",
                       timeout=timeout, env=ENV, input=input)
    if check and p.returncode != 0:
        raise RuntimeError(f"{' '.join(args[:3])}...: {(p.stdout + p.stderr).strip()[-1500:]}")
    return p


def mount(path: Path) -> str:
    return str(path.resolve()).replace("\\", "/")


@contextmanager
def locked(name: str):
    """One capture at a time per node_modules volume (another one would reinstall under it)."""
    LOCKS.mkdir(parents=True, exist_ok=True)
    lock = LOCKS / name
    start = time.time()
    while True:
        try:
            lock.mkdir()
            break
        except FileExistsError:
            if time.time() - lock.stat().st_mtime > 3 * 3600:   # left behind by a killed run
                shutil.rmtree(lock, ignore_errors=True)
                continue
            if time.time() - start > 3 * 3600:
                fail(f"waited too long for {name}")
            time.sleep(5)
    try:
        yield
    finally:
        shutil.rmtree(lock, ignore_errors=True)


def base_image(code: Path) -> str:
    text = (code / "Dockerfile").read_text(encoding="utf-8")
    m = re.search(r"(?im)^FROM\s+(\S+)", text)
    if not m:
        fail("its Dockerfile names no base image")
    return m.group(1)


def volume(kind: str, image: str, lock: Path) -> str:
    h = hashlib.sha256(image.encode() + b"\0" + (lock.read_bytes() if lock.exists() else b"")).hexdigest()[:12]
    return f"locotoko-demo-nm-{kind}-{h}"


# lockfix.js (scripts/demo) first: installs what the version got when it was released (see there).
BUILD = r"""
set -e
export YARN_IGNORE_PATH=1 CHECKPOINT_DISABLE=1 PRISMA_HIDE_UPDATE_MESSAGE=1 CI=true
node /demo/lockfix.js /src/client "$DEMO_DATE"
node /demo/lockfix.js /src "$DEMO_DATE"
cd /src/client
yarn install --non-interactive --network-timeout 600000 --ignore-engines
VUE_APP_API_BASE_URL=http://app:3333 yarn build
cd /src
yarn install --non-interactive --network-timeout 600000 --ignore-engines
npx prisma generate
if grep -q '"build:prod"' package.json; then yarn build:prod; else yarn build; fi
"""


def build(code: Path, image: str, srv: str, cli: str, date: str) -> None:
    p = run("docker", "run", "--rm", "-v", f"{mount(code)}:/src", "-v", f"{srv}:/src/node_modules",
            "-v", f"{cli}:/src/client/node_modules", "-v", f"{mount(REPO / 'scripts' / 'demo')}:/demo:ro",
            "-e", f"DEMO_DATE={date}", "-w", "/src", image, "sh", "-c", BUILD,
            check=False, timeout=3600)
    for l in (p.stdout + p.stderr).splitlines():
        if l.startswith("lockfix:"):
            print(l, flush=True)
    if p.returncode != 0:
        tail = [l for l in (p.stdout + p.stderr).splitlines() if l.strip()][-6:]
        fail("it doesn't build anymore: " + " | ".join(tail)[-400:])


def main_js(code: Path) -> str:
    for rel in ("dist/main.js", "dist/src/main.js"):
        if (code / rel).exists():
            return rel
    fail("the server build left no dist/main.js")
    return ""


def routes(code: Path) -> list[str]:
    router = code / "client" / "src" / "router" / "index.js"
    if not router.exists():
        return []
    return re.findall(r"""path:\s*["']([^"']+)["']""", router.read_text(encoding="utf-8"))


# ---- seeding -------------------------------------------------------------------------------

def lit(value, udt: str) -> str:
    if value is None:
        return "NULL"
    if udt.startswith("_"):
        items = value if isinstance(value, list) else [value]
        return "ARRAY[" + ",".join(lit(v, udt[1:]) for v in items) + f"]::{udt[1:]}[]" if items else f"'{{}}'::{udt[1:]}[]"
    if isinstance(value, list):
        value = value[0] if value else ""
    if udt == "bool":
        return "TRUE" if value else "FALSE"
    if udt in ("int2", "int4", "int8"):
        return str(int(float(value)))
    if udt in ("numeric", "float4", "float8"):
        return str(value)
    if udt == "money":
        return f"'{value}'::money"
    if isinstance(value, datetime):
        value = value.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
    if isinstance(value, (dict,)):
        value = json.dumps(value)
    s = str(value).replace("'", "''")
    return f"'{s}'"


def filler(udt: str):
    return {"bool": False, "int2": 0, "int4": 0, "int8": 0, "numeric": "0", "float4": 0, "float8": 0,
            "money": "0.00", "timestamp": datetime.now(), "timestamptz": datetime.now(), "date": datetime.now()
            }.get(udt, [] if udt.startswith("_") else "")


def insert(cols: dict, table: str, row: dict) -> str:
    """An INSERT for the columns this version's table has; NOT NULL columns without a default get a blank."""
    have = cols.get(table)
    if not have:
        return ""
    names, values = [], []
    for col, (nullable, default, udt) in have.items():
        if col in row and (row[col] is not None or nullable):
            v = row[col]
        elif col in row and default is not None:   # None for a NOT NULL column: its default
            continue
        elif not nullable and default is None:
            v = filler(udt)
        else:
            continue
        names.append(f'"{col}"')
        values.append(lit(v, udt))
    return f'INSERT INTO "{table}" ({", ".join(names)}) VALUES ({", ".join(values)});'


def cuid(name: str) -> str:
    """A steady id shaped like Prisma's cuid() for a demo name (the app shows an item id's last 4 characters)."""
    return "cl" + hashlib.sha1(name.encode()).hexdigest()[:23]


def with_ids(data):
    """demo/data.json with every "demo-..." name turned into a cuid; items keep theirs as "photo"."""
    if isinstance(data, dict):
        out = {k: with_ids(v) for k, v in data.items()}
        if "kind" in data and "id" in data:
            out["photo"] = data["id"]
        return out
    if isinstance(data, list):
        return [with_ids(v) for v in data]
    if isinstance(data, str) and data.startswith("demo-"):
        return cuid(data)
    return data


def seed_sql(cols: dict, data: dict, user_hash: str) -> str:
    now = datetime.now().replace(microsecond=0)
    day = lambda d: None if d is None else now + timedelta(days=d, hours=-3, minutes=(abs(d) * 37) % 50)  # noqa: E731
    t = {name.lower(): name for name in cols}
    table = lambda n: t.get(n.lower(), n)  # noqa: E731
    out = ["BEGIN;", "SET session_replication_role = replica;"]
    u = data["user"]
    user_id = cuid("demo-user-riley")
    out.append(insert(cols, table("users"), {"id": user_id, "createdAt": day(-70), "updatedAt": day(-70),
                                               "email": u["email"], "hash": user_hash, "name": u["name"]}))
    for c in data["categories"]:
        out.append(insert(cols, table("ebayCategories"), c))
    for o in data["owners"]:
        out.append(insert(cols, table("owners"), o))
    for a in data["acquisitions"]:
        out.append(insert(cols, table("acquisitions"), {**a, "date": day(a["day"])}))
    for p in data["payouts"]:
        out.append(insert(cols, table("payouts"), {**p, "date": day(p["day"])}))
    tpls = {tp["id"]: tp for tp in data["templates"]}
    for tp in data["templates"]:
        out.append(insert(cols, table("templates"), {**tp, "specifics": json.dumps(tp["specifics"]),
                                                     "shippingType": 1, "conditions": "[]"}))
    for n, it in enumerate(data["items"], start=1):
        tp = tpls[it["template"]]
        images = [f"data:image/jpeg;base64,{base64.b64encode((DEMO / 'images' / f'{it['photo']}_{k:02d}.jpg').read_bytes()).decode()}"
                  for k in (1, 2)]
        status = it["status"]
        listing = f"1000000{n:05d}" if status != "draft" else None   # NULL where allowed (once unique), else ""
        markdown = it.get("markdown", 0)
        price = float(it["price"])
        row = {k: tp.get(k) for k in ("weightPounds", "weightOunces", "shipWeightPounds", "shipWeightOunces",
                                      "sizeHeightInches", "sizeWidthInches", "sizeDepthInches", "shipSizeHeightInches",
                                      "shipSizeWidthInches", "shipSizeDepthInches", "location")}
        row.update({
            "id": it["id"], "createdAt": day(it["created"]), "updatedAt": day(it.get("sold", it.get("listed", it["created"]))),
            "title": it["title"], "description": it["description"], "price": it["price"],
            "currentPrice": f"{price * (100 - markdown) / 100:.2f}", "markdownPct": markdown,
            "quantity": 1, "quantitySold": 1 if status == "sold" else 0,
            "soldAt": day(it.get("sold")), "soldDate": day(it.get("sold")),
            "soldPrice": it.get("soldPrice", "0.00"),
            "shippedAt": day(it.get("shipped")), "shippedDate": day(it.get("shipped")),
            "acquisitionDate": day(it["created"]),
            "ebayCategoryId": tp["ebayCategoryId"], "ebayConditionId": 3000, "ebayListingId": listing,
            "listingUserId": user_id, "listingAgentId": user_id,
            "shippingUserId": user_id if it.get("shipped") else None,
            "shippingAgentId": user_id if it.get("shipped") else None,
            "ownerId": it["owner"], "acquisitionId": it.get("acq"), "templateId": tp["id"],
            "specifics": json.dumps(tp["specifics"][:1] + it.get("specifics", [])),
            "images": images, "ready": bool(it.get("ready")) or status != "draft",
            "listedAt": day(it.get("listed")), "endedAt": day(it.get("ended")),
            "shippingPrice": "0.00", "shippingType": 1, "upc": "",
        })
        out.append(insert(cols, table("items"), row))
        if listing and table("ebayListings") in cols:
            out.append(insert(cols, table("ebayListings"), {"id": listing, "itemId": it["id"],
                                                            "createdAt": day(it.get("listed")), "updatedAt": day(it.get("listed"))}))
    out += ["SET session_replication_role = DEFAULT;", "COMMIT;"]
    return "\n".join(s for s in out if s) + "\n"


def columns(db: str) -> dict:
    q = ("SELECT table_name, column_name, is_nullable, coalesce(column_default, '\\N'), udt_name "
         "FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name, ordinal_position")
    p = run("docker", "exec", db, "psql", "-U", "demo", "-d", "locotoko", "-At", "-F", "\t", "-c", q)
    cols: dict = {}
    for line in p.stdout.splitlines():
        table, col, nullable, default, udt = line.split("\t")
        if table == "_prisma_migrations":
            continue
        cols.setdefault(table, {})[col] = (nullable == "YES", None if default == "\\N" else default, udt)
    return cols


# ---- the run -------------------------------------------------------------------------------

def wait_for_server(app: str, seconds: int = 240) -> None:
    end = time.time() + seconds
    while time.time() < end:
        state = run("docker", "inspect", "-f", "{{.State.Running}}", app, check=False).stdout.strip()
        if state != "true":
            logs = run("docker", "logs", "--tail", "8", app, check=False)
            tail = [l for l in (logs.stdout + logs.stderr).splitlines() if l.strip()][-4:]
            fail("the server stopped on start: " + " | ".join(tail)[-400:])
        p = run("docker", "exec", app, "node", "-e",
                "require('http').get('http://127.0.0.1:3333/api/v1/owners',r=>process.exit(r.statusCode<500?0:1))"
                ".on('error',()=>process.exit(1))", check=False, timeout=30)
        if p.returncode == 0:
            return
        time.sleep(3)
    fail("the server didn't answer within 4 minutes")


def capture(code: Path, out: Path, version: str, date: str) -> None:
    data = with_ids(json.loads((DEMO / "data.json").read_text(encoding="utf-8")))
    image = base_image(code)
    srv = volume("srv", image, code / "yarn.lock")
    cli = volume("cli", image, code / "client" / "yarn.lock")
    name = f"Locotoko v{version}"
    out.mkdir(parents=True, exist_ok=True)
    with locked(srv), locked(cli):
        build(code, image, srv, cli, date)
        if not (code / "client" / "dist" / "index.html").exists():
            fail("the client build left no index.html")
        entry = main_js(code)
        serves_client = "ServeStatic" in (code / "src" / "app.module.ts").read_text(encoding="utf-8")
        if serves_client:
            for target in {code / "dist" / "client", (code / entry).parent / "client"}:
                shutil.rmtree(target, ignore_errors=True)
                shutil.copytree(code / "client" / "dist", target)

        tag = uuid.uuid4().hex[:8]
        net, db, app = f"locotoko-demo-{tag}", f"locotoko-demo-{tag}-db", f"locotoko-demo-{tag}-app"
        try:
            run("docker", "network", "create", "--internal", net)
            run("docker", "run", "-d", "--name", db, "--network", net, "--network-alias", "db",
                "-e", "POSTGRES_USER=demo", "-e", "POSTGRES_PASSWORD=demo", "-e", "POSTGRES_DB=locotoko", PG_IMAGE)
            for _ in range(60):
                if run("docker", "exec", db, "pg_isready", "-U", "demo", "-d", "locotoko", check=False).returncode == 0:
                    break
                time.sleep(1)
            time.sleep(2)
            env = ["-e", "DATABASE_URL=postgresql://demo:demo@db:5432/locotoko?schema=public",
                   "-e", "JWT_SECRET=demo-only-secret", "-e", "ALLOW_REGISTRATION=false", "-e", "USE_SSL=false",
                   "-e", "NODE_ENV=development", "-e", "CHECKPOINT_DISABLE=1", "-e", "PRISMA_HIDE_UPDATE_MESSAGE=1",
                   "-e", "TZ=America/Denver",
                   # Versions that make their AI clients at startup stop without a key; the network
                   # has no way out, so these placeholders never reach anyone.
                   "-e", "OPENAI_API_KEY=demo-placeholder", "-e", "ANTHROPIC_API_KEY=demo-placeholder",
                   "-e", "TMDB_API_KEY=demo-placeholder"]
            mig = run("docker", "run", "--rm", "--network", net, *env, "-v", f"{mount(code)}:/src",
                      "-v", f"{srv}:/src/node_modules", "-w", "/src", image,
                      "node", "node_modules/prisma/build/index.js", "migrate", "deploy", check=False, timeout=600)
            if mig.returncode != 0:
                tail = [l for l in (mig.stdout + mig.stderr).splitlines() if l.strip()][-4:]
                fail("its migrations didn't apply: " + " | ".join(tail)[-400:])
            run("docker", "run", "-d", "--name", app, "--network", net, "--network-alias", "app", *env,
                "-v", f"{mount(code)}:/src", "-v", f"{srv}:/src/node_modules", "-w", "/src", image, "node", entry)
            wait_for_server(app)
            h = run("docker", "exec", app, "node", "-e",
                    f"require('argon2').hash({json.dumps(data['user']['password'])}).then(h=>console.log(h))")
            sql = seed_sql(columns(db), data, h.stdout.strip())
            p = run("docker", "exec", "-i", db, "psql", "-v", "ON_ERROR_STOP=1", "-U", "demo", "-d", "locotoko",
                    "-q", input=sql, check=False)
            if p.returncode != 0:
                fail("the demo data didn't fit its database: " + (p.stderr or p.stdout).strip()[-300:])

            mounts = ["-v", f"{mount(REPO / 'scripts' / 'demo')}:/demo:ro", "-v", f"{mount(out)}:/out"]
            extra = []
            if not serves_client:
                mounts += ["-v", f"{mount(code / 'client' / 'dist')}:/client:ro"]
                extra = ["--static", "/client"]
            first = data["items"][0]
            drive = run("docker", "run", "--rm", "--network", net, "--ipc=host", *mounts, BROWSER_IMAGE,
                        "python", "/demo/drive.py", "--out", "/out", "--name", name, *extra,
                        "--email", data["user"]["email"], "--password", data["user"]["password"],
                        "--item", first["id"], "--template", first["template"],
                        "--expect", *[it["title"][:24] for it in data["items"]], "--routes", *routes(code), check=False, timeout=900)
            lines = [l for l in (drive.stdout + drive.stderr).splitlines() if l.strip()]
            for l in lines:
                if l.startswith(("blocked", "EMPTY:")):
                    print(l, flush=True)
            if drive.returncode != 0:
                reason = next((l[8:] for l in reversed(lines) if l.startswith("CANNOT: ")), " | ".join(lines[-3:]))
                fail(reason[-400:])
        finally:
            if os.environ.get("LOCOTOKO_DEMO_KEEP"):     # debugging: leave them up
                print(f"kept {app} {db} {net}", flush=True)
                return
            run("docker", "rm", "-f", app, db, check=False)
            run("docker", "network", "rm", net, check=False)

    webm, mp4 = out / f"{name}.webm", out / f"{name}.mp4"
    done = run("ffmpeg", "-y", "-loglevel", "error", "-i", str(webm), "-c:v", "libx264", "-preset", "veryfast",
               "-crf", "32", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", str(mp4), check=False)
    if done.returncode != 0 or not mp4.exists():
        fail("ffmpeg couldn't make the mp4")
    webm.unlink(missing_ok=True)
    print(f"ok {name}", flush=True)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--code", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--version", required=True)
    ap.add_argument("--date", default=datetime.now().strftime("%Y-%m-%d"),
                    help="the version's release day: packages its lockfile doesn't pin resolve as of then")
    args = ap.parse_args()
    if run("docker", "image", "inspect", BROWSER_IMAGE, check=False).returncode != 0:
        run("docker", "build", "-q", "-t", BROWSER_IMAGE, "-f", str(REPO / "scripts" / "demo" / "Dockerfile.browser"),
            str(REPO / "scripts" / "demo"), timeout=1800)
    try:
        capture(args.code, args.out, args.version.lstrip("v"), args.date)
    except subprocess.TimeoutExpired as e:
        fail(f"a step took too long ({' '.join(map(str, e.cmd[:4]))})")
    except RuntimeError as e:
        fail(str(e).splitlines()[0][:300])


if __name__ == "__main__":
    main()
