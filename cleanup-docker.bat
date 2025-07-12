@echo off
echo 🧹 Cleaning up Docker system...

REM Stop and remove all containers
docker stop $(docker ps -aq) 2>nul
docker rm $(docker ps -aq) 2>nul

REM Remove all images
docker rmi $(docker images -q) -f 2>nul

REM Remove all volumes
docker volume rm $(docker volume ls -q) -f 2>nul

REM Remove all build cache
docker builder prune --all --force

echo ✅ Docker system cleanup complete.
pause 