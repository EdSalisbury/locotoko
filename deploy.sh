#!/bin/bash

# Exit on any error
set -e

# Ensure we're in the project root
cd "$(dirname "$0")"

# Run yarn version interactively (this will prompt you)
yarn version

# Extract the new version from package.json AFTER yarn version completes
VERSION=$(grep '"version"' package.json | awk -F '"' '{print $4}')

echo "📦 New version selected: $VERSION"

# Update the client package.json with the same version
cd client
yarn version --no-git-tag-version --new-version "$VERSION"
cd ..

# Commit and tag the new version
git add package.json client/package.json
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
ssh 192.168.1.42 -- "/home/ed/locotoko/restart.sh"

echo "🚀 Deployment successful: Version $VERSION"
