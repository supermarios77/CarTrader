#!/usr/bin/env bash

# Set timeout for Docker Compose
export COMPOSE_HTTP_TIMEOUT=600

echo "=== Rebuilding All Services ==="
echo ""

echo "--- 1/8 Building api-gateway ---"
docker compose build --progress=plain api-gateway
echo ""

echo "--- 2/8 Building auth-service ---"
docker compose build --progress=plain auth-service
echo ""

echo "--- 3/8 Building listings-service ---"
docker compose build --progress=plain listings-service
echo ""

echo "--- 4/8 Building media-service ---"
docker compose build --progress=plain media-service
echo ""

echo "--- 5/8 Building notifications-service ---"
docker compose build --progress=plain notifications-service
echo ""

echo "--- 6/8 Building search-service ---"
docker compose build --progress=plain search-service
echo ""

echo "--- 7/8 Building payments-service ---"
docker compose build --progress=plain payments-service
echo ""

echo "--- 8/8 Building orders-service ---"
docker compose build --progress=plain orders-service
echo ""

echo "=== All Services Rebuilt ==="
echo ""
echo "Next steps:"
echo "  docker compose up -d"
echo "  ./scripts/test-endpoints.sh"

