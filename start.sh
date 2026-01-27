#!/bin/bash

# CivicCare Quick Start Script
# This script sets up and starts both backend and frontend servers

echo "🚀 CivicCare - Smart City Complaint & Awareness Portal"
echo "========================================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js is not installed. Please install Node.js v16+${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js version: $(node --version)${NC}"
echo ""

# Backend Setup
echo -e "${BLUE}Setting up Backend...${NC}"
cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/civiccare
JWT_SECRET=civiccare_jwt_secret_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
fi

# Seed data
echo "Seeding sample data..."
npm run seed

# Start backend
echo -e "${GREEN}✓ Backend setup complete${NC}"
echo ""

# Frontend Setup
cd ..
echo -e "${BLUE}Setting up Frontend...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
fi

echo -e "${GREEN}✓ Frontend setup complete${NC}"
echo ""

# Instructions
echo -e "${YELLOW}========================================================"
echo "📋 NEXT STEPS:"
echo "========================================================"
echo ""
echo -e "${BLUE}1. Open Terminal 1 and run:${NC}"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo -e "${BLUE}2. Open Terminal 2 and run:${NC}"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo -e "${BLUE}3. Backend will start on: http://localhost:5000${NC}"
echo -e "${BLUE}4. Frontend will start on: http://localhost:5173${NC}"
echo ""
echo -e "${YELLOW}📝 Sample Credentials:${NC}"
echo ""
echo "Citizen User:"
echo "  Email: citizen1@civiccare.com"
echo "  Password: password123"
echo ""
echo "Admin (Waste Department):"
echo "  Email: admin.waste@civiccare.com"
echo "  Password: admin123"
echo ""
echo -e "${GREEN}✓ Setup complete! Happy coding! 🎉${NC}"
