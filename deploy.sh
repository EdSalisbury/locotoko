#!/bin/bash

# Exit on any error
set -e

# Ensure we're in the project root
cd "$(dirname "$0")"

OLD_VERSION=$(grep '"version"' package.json | awk -F '"' '{print $4}')

# With a version argument (./deploy.sh 1.2.3) set it directly, which works
# without a terminal; otherwise run yarn version interactively (it prompts).
# A release with something new to see (a new screen, a redesign, a feature worth
# demoing) keeps its video: ./deploy.sh 1.2.3 --show "what there is to see" lists it
# in demo/videos.txt. Every other release gets just its notes and screenshot.
SHOW=""
if [ "$1" = "--show" ]; then
  echo "❌ --show goes after the version: ./deploy.sh 1.2.3 --show \"New owners page\"" >&2
  exit 1
fi
if [ "$2" = "--show" ]; then
  SHOW="$3"
  if [ -z "$SHOW" ]; then
    echo "❌ --show needs what there is to see: ./deploy.sh 1.2.3 --show \"New owners page\"" >&2
    exit 1
  fi
elif [ -n "$2" ]; then
  echo "❌ Unknown option $2 (usage: ./deploy.sh [version] [--show \"what's new to see\"])" >&2
  exit 1
fi
if [ -n "$1" ]; then
  yarn version --no-git-tag-version --new-version "$1"
else
  yarn version
fi

# Extract the new version from package.json AFTER yarn version completes
VERSION=$(grep '"version"' package.json | awk -F '"' '{print $4}')

if [ "$VERSION" = "$OLD_VERSION" ]; then
  echo "❌ Version is still $VERSION; nothing to deploy." >&2
  exit 1
fi

echo "📦 New version selected: $VERSION"

# Update the client package.json with the same version. npm, not yarn: the
# root .yarnrc's relative yarn-path doesn't resolve from inside client/.
cd client
npm version --no-git-tag-version --allow-same-version "$VERSION"
cd ..

# Commit and tag the new version
git add package.json client/package.json
if [ -n "$SHOW" ]; then
  printf '%s  %s\n' "$VERSION" "$SHOW" >> demo/videos.txt
  git add demo/videos.txt
fi
git commit -m "Updated version to $VERSION"
git tag "$VERSION"
git push origin
git push origin "$VERSION"

# Build and tag the Docker image
docker build -t edsalisbury/locotoko:"$VERSION" .
docker tag edsalisbury/locotoko:"$VERSION" edsalisbury/locotoko:latest

# Push Docker images
docker push edsalisbury/locotoko:"$VERSION"
docker push edsalisbury/locotoko:latest

# Restart the server via SSH
ssh 192.168.1.44 "cd /srv/docker/store.bluedragontrading.ltd && docker compose pull && docker compose up -d"

echo "🚀 Deployment successful: Version $VERSION"

# Release notes, screenshot and video for this version (scripts/demo_backfill.py), when
# this machine keeps a releases folder: ~/.config/locotoko/release.env or .env.release
# (gitignored) sets RELEASE_HOME and PYTHON. Made with the demo data only; a failure
# here doesn't undo the deploy. --cull then drops the previous release's video unless
# it was listed with --show (the newest always keeps one).
if [ -f "$HOME/.config/locotoko/release.env" ]; then
  # shellcheck disable=SC1091
  . "$HOME/.config/locotoko/release.env"
fi
if [ -f .env.release ]; then
  # shellcheck disable=SC1091
  . ./.env.release
fi
if [ -n "$RELEASE_HOME" ]; then
  "${PYTHON:-python}" scripts/demo_backfill.py --home "$RELEASE_HOME" --only "$VERSION" --jobs 1 --cull \
    || echo "⚠️ The release capture for $VERSION didn't finish; run scripts/demo_backfill.py again." >&2
fi
