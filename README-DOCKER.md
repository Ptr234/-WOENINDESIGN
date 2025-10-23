# Docker Setup for Design Marketplace

This document explains how to set up and run the Design Marketplace application using Docker.

## Prerequisites

1. **Docker** - Install Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
2. **Docker Compose** - Usually included with Docker Desktop

## Quick Start

### 1. Start the Database

```bash
# Start PostgreSQL database with Docker
npm run docker:up
```

This will:
- Start a PostgreSQL database on port 5432
- Start Adminer (database management tool) on port 8080
- Automatically create the `designer_portal` database
- Run the database schema setup

### 2. Start the Application

```bash
# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Database Admin**: http://localhost:8080

## Database Management

### Access Database via Adminer

1. Open http://localhost:8080
2. Use these credentials:
   - **Server**: postgres
   - **Username**: postgres
   - **Password**: password123
   - **Database**: designer_portal

### Direct Database Access

```bash
# Connect to PostgreSQL directly
docker exec -it designer_portal_db psql -U postgres -d designer_portal
```

## Available Scripts

```bash
# Database Management
npm run docker:up       # Start database containers
npm run docker:down     # Stop database containers
npm run docker:logs     # View database logs

# Database Operations
npm run db:setup        # Set up database schema
npm run db:seed         # Seed with sample data
npm run db:reset        # Reset database

# Application
npm run dev             # Start development server
npm run build           # Build for production
npm run start           # Start production server
```

## Environment Variables

The application uses these database settings (in `.env.local`):

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=designer_portal
DB_USER=postgres
DB_PASSWORD=password123
```

## Troubleshooting

### Port Conflicts

If port 5432 is already in use:

```bash
# Stop the conflicting service
sudo systemctl stop postgresql

# Or change the port in docker-compose.yml
ports:
  - "5433:5432"  # Use port 5433 instead
```

### Database Connection Issues

```bash
# Check container status
docker ps

# View database logs
npm run docker:logs

# Restart containers
npm run docker:down
npm run docker:up
```

### Reset Everything

```bash
# Stop containers and remove data
npm run docker:down
docker volume rm backend_postgres_data

# Start fresh
npm run docker:up
```

## Production Deployment

For production, use the included Dockerfile:

```bash
# Build the application image
docker build -t design-marketplace .

# Run with external database
docker run -e DB_HOST=your-prod-db -p 3000:3000 design-marketplace
```

## Development Workflow

1. **Start development**:
   ```bash
   npm run docker:up    # Start database
   npm run dev          # Start Next.js dev server
   ```

2. **Make database changes**:
   ```bash
   # Edit src/lib/database/schema.sql
   npm run db:reset     # Apply changes
   ```

3. **End development**:
   ```bash
   npm run docker:down  # Stop database
   ```

## Features

- **PostgreSQL 15** with Alpine Linux for minimal size
- **Adminer** for easy database management
- **Volume persistence** - data survives container restarts
- **Health checks** - ensures database is ready
- **Auto-initialization** - schema is applied on first start
- **Development optimized** - fast startup and easy debugging