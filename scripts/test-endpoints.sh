#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=== CarTrader Endpoint Health Checks ==="
echo ""

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$url" 2>&1)
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" --max-time 3 "$url" 2>&1)
    fi
    
    if [ "$response" = "200" ] || [ "$response" = "201" ] || [ "$response" = "204" ] || [ "$response" = "302" ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $response)"
        return 0
    elif [ "$response" = "000" ]; then
        echo -e "${RED}✗ Connection Failed${NC}"
        return 1
    elif [ "$response" = "404" ]; then
        echo -e "${YELLOW}⚠ Not Found${NC} (HTTP $response)"
        return 1
    elif [ "$response" = "401" ] || [ "$response" = "403" ]; then
        echo -e "${YELLOW}⚠ Auth Required${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}✗ Failed${NC} (HTTP $response)"
        return 1
    fi
}

# Infrastructure Services
echo "--- Infrastructure Services ---"
test_endpoint "Grafana Health" "http://localhost:3001/api/health"
test_endpoint "Grafana Web UI" "http://localhost:3001"
test_endpoint "OpenSearch Cluster Health" "http://localhost:9200/_cluster/health"
test_endpoint "OpenSearch Info" "http://localhost:9200"
test_endpoint "MailHog API" "http://localhost:8025/api/v2/messages"
test_endpoint "MailHog Web UI" "http://localhost:8025"
test_endpoint "MinIO API" "http://localhost:9000/minio/health/live"
test_endpoint "MinIO Console" "http://localhost:9001"
test_endpoint "Redis (via telnet)" "redis://localhost:6379" || echo -e "${YELLOW}⚠ Redis check skipped${NC}"
echo ""

# Application Services - Health Endpoints
echo "--- Application Services (Health) ---"
test_endpoint "API Gateway Health" "http://localhost:3000/healthz/ready"
test_endpoint "Auth Service Health" "http://localhost:3010/healthz/ready"
test_endpoint "Listings Service Health" "http://localhost:3020/api/healthz/ready"
test_endpoint "Media Service Health" "http://localhost:3030/api/healthz/ready"
test_endpoint "Notifications Service Health" "http://localhost:3040/api/healthz/ready"
test_endpoint "Search Service Health" "http://localhost:3050/api/healthz/ready"
test_endpoint "Payments Service Health" "http://localhost:3060/api/healthz/ready"
test_endpoint "Orders Service Health" "http://localhost:3070/api/healthz/ready"
test_endpoint "OTel Collector Health" "http://localhost:13133/healthz"
echo ""

# Application Services - API Endpoints
echo "--- Application Services (API Endpoints) ---"
test_endpoint "API Gateway Root" "http://localhost:3000/api"
test_endpoint "API Gateway V1" "http://localhost:3000/api/v1"
test_endpoint "Auth Service Root" "http://localhost:3010"
test_endpoint "Listings Service Root" "http://localhost:3020/api"
test_endpoint "Media Service Root" "http://localhost:3030/api"
test_endpoint "Notifications Service Root" "http://localhost:3040/api"
test_endpoint "Search Service Root" "http://localhost:3050/api"
test_endpoint "Payments Service Root" "http://localhost:3060/api"
test_endpoint "Orders Service Root" "http://localhost:3070/api"
echo ""

# Observability Services
echo "--- Observability Services ---"
test_endpoint "Loki Ready" "http://localhost:3100/ready"
test_endpoint "Loki Metrics" "http://localhost:3100/metrics"
test_endpoint "Tempo Ready" "http://localhost:3200/ready"
test_endpoint "Promtail Ready" "http://localhost:9080/ready" || echo -e "${YELLOW}⚠ Promtail metrics port not exposed${NC}"
echo ""

echo "=== Test Complete ==="

