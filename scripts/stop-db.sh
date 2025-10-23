#!/bin/bash

echo "🛑 Stopping Docker containers..."

# Stop the containers
if docker compose version &> /dev/null; then
    docker compose down
else
    docker-compose down
fi

echo "✅ Containers stopped successfully!"