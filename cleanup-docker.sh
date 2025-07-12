#!/bin/bash

echo "🧹 Cleaning up Docker system..."

# Stop and remove all containers
docker stop $(docker ps -aq) 2>/dev/null
docker rm $(docker ps -aq) 2>/dev/null

# Remove all images
docker rmi $(docker images -q) -f 2>/dev/null

# Remove all volumes
docker volume rm $(docker volume ls -q) -f 2>/dev/null

# Remove all build cache
docker builder prune --all --force

echo "✅ Docker system cleanup complete." 