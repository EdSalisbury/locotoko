"""Runs Locotoko's checks in a Linux container, the way the image builds:
the server's jest suite and TypeScript check, the database migrations on a
throwaway Postgres, and the client's lint and build.

    python scripts/test_linux.py

Needs Docker. The repo is copied into the container (without node_modules),
so nothing here changes the checkout. Exits non-zero if anything fails.
"""

import subprocess
import sys
import uuid
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
NODE_IMAGE = "node:24-alpine"  # what the Dockerfile builds on
POSTGRES_IMAGE = "postgres:13"  # what Ratchet runs

SCRIPT = r"""
set -e
mkdir -p /work
cd /src
tar --exclude=./node_modules --exclude=./client/node_modules --exclude=./ebay/node_modules \
    --exclude=./dist --exclude=./client/dist --exclude=./.git -cf - . | tar -xf - -C /work
cd /work
echo "== server: yarn install"
yarn install --frozen-lockfile --network-timeout 600000 > /tmp/install.log 2>&1 || { tail -50 /tmp/install.log; exit 1; }
npx prisma generate > /dev/null
echo "== server: jest"
yarn -s jest --ci
echo "== server: tsc"
npx tsc --noEmit -p tsconfig.json
echo "== migrations on a fresh Postgres"
DATABASE_URL="postgresql://postgres:test@$DB_HOST:5432/locotoko" npx prisma migrate deploy
echo "-- what schema.prisma has that the migrations don't (for information; an old"
echo "-- acquisitionId foreign key that was never migrated shows up here):"
npx prisma migrate diff --from-url "postgresql://postgres:test@$DB_HOST:5432/locotoko" \
    --to-schema-datamodel prisma/schema.prisma || true
echo "== client: install, lint, build"
# As the Dockerfile's client stage does: the root's Yarn release and settings.
cp -r .yarn client/.yarn
cp .yarnrc.yml client/.yarnrc.yml
cd client
yarn install --frozen-lockfile --network-timeout 600000 > /tmp/client-install.log 2>&1 || { tail -50 /tmp/client-install.log; exit 1; }
npx eslint src
npx vite build > /tmp/build.log 2>&1 || { tail -50 /tmp/build.log; exit 1; }
echo "== all checks passed"
"""


def run(args, **kwargs):
    return subprocess.run(args, **kwargs)


def main():
    tag = uuid.uuid4().hex[:8]
    network = f"locotoko-test-{tag}"
    db = f"locotoko-test-db-{tag}"
    run(["docker", "network", "create", network], check=True, stdout=subprocess.DEVNULL)
    try:
        run(
            ["docker", "run", "-d", "--rm", "--name", db, "--network", network,
             "-e", "POSTGRES_PASSWORD=test", "-e", "POSTGRES_DB=locotoko", POSTGRES_IMAGE],
            check=True, stdout=subprocess.DEVNULL,
        )
        # Wait for Postgres to accept connections.
        for _ in range(60):
            ready = run(["docker", "exec", db, "pg_isready", "-U", "postgres"], stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL)
            if ready.returncode == 0:
                break
            subprocess.run(["docker", "exec", db, "sleep", "1"], stdout=subprocess.DEVNULL)
        result = run(
            ["docker", "run", "--rm", "--network", network, "-e", f"DB_HOST={db}",
             "-v", f"{REPO}:/src:ro", NODE_IMAGE, "sh", "-c", SCRIPT],
        )
        return result.returncode
    finally:
        run(["docker", "rm", "-f", db], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        run(["docker", "network", "rm", network], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


if __name__ == "__main__":
    sys.exit(main())
