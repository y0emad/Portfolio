#!/bin/sh
set -eu

IMAGE="${IMAGE:-yousefemad/portfolio:latest}"
NAME="portfolio"
NETWORK="clinicflow"
ENV_FILE="$HOME/portfolio.env"

running=$(docker inspect -f '{{.Image}}' "$NAME" 2>/dev/null || true)
docker pull -q "$IMAGE" >/dev/null
latest=$(docker image inspect -f '{{.Id}}' "$IMAGE")

if [ "$running" = "$latest" ]; then
  exit 0
fi

echo "$(date -Is) new image $latest, restarting $NAME"
docker rm -f "$NAME" >/dev/null 2>&1 || true
docker run -d --name "$NAME" --restart unless-stopped --network "$NETWORK" --env-file "$ENV_FILE" "$IMAGE" >/dev/null

for _ in $(seq 1 30); do
  if docker exec "$NAME" node -e "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>/dev/null; then
    echo "$(date -Is) deployed, healthy"
    docker image prune -f >/dev/null
    exit 0
  fi
  sleep 2
done

echo "$(date -Is) WARNING: $NAME is not healthy, check: docker logs $NAME"
exit 1
