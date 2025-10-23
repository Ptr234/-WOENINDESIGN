#!/bin/bash

echo "🐳 Starting Docker containers..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

# Start the containers
if docker compose version &> /dev/null; then
    docker compose up -d
else
    docker-compose up -d
fi

echo "⏳ Waiting for PostgreSQL to be ready..."

# Wait for PostgreSQL to be ready
until docker exec designer_portal_db pg_isready -U postgres -d designer_portal; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done

echo "✅ PostgreSQL is ready!"
echo "🌐 Database is available at: localhost:5432"
echo "🗄️  Database Management (Adminer) at: http://localhost:8080"
echo "📊 Connection details:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: designer_portal"
echo "   Username: postgres"
echo "   Password: password123"

echo ""
echo "🚀 You can now run your Next.js application:"
echo "   npm run dev"