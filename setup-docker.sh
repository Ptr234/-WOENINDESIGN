#!/bin/bash

echo "🐳 Setting up Docker for Design Marketplace"
echo "⚠️  This script requires sudo privileges"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "❌ Please don't run this script as root. Run as regular user with sudo access."
    exit 1
fi

# Check if Docker is already installed
if command -v docker &> /dev/null; then
    echo "✅ Docker is already installed"
    docker --version
else
    echo "📦 Installing Docker..."
    
    # Update package index
    sudo apt-get update
    
    # Install required packages
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    
    # Add Docker's official GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Set up the repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Update package index again
    sudo apt-get update
    
    # Install Docker Engine
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    echo "✅ Docker installed successfully"
fi

# Add current user to docker group
echo "👤 Adding user to docker group..."
sudo usermod -aG docker $USER

# Start Docker service
echo "🚀 Starting Docker service..."
sudo systemctl start docker
sudo systemctl enable docker

echo ""
echo "✅ Docker setup complete!"
echo ""
echo "⚠️  IMPORTANT: You need to log out and log back in (or restart) for group changes to take effect."
echo ""
echo "After logging back in, test with:"
echo "  docker --version"
echo "  docker ps"
echo ""
echo "Then start the database:"
echo "  cd /home/peter/backend"
echo "  npm run docker:up"