#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Arawn Monorepo Template Setup        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}Error: pnpm is not installed${NC}"
    echo "Install it with: npm install -g pnpm"
    exit 1
fi

# Check if Node.js version is >= 20
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}Error: Node.js version must be >= 20.0.0${NC}"
    echo "Current version: $(node -v)"
    exit 1
fi

echo -e "${YELLOW}This script will help you set up a new project from this template.${NC}"
echo ""

# Prompt for project name
read -p "Enter your project name (e.g., my-awesome-app): " PROJECT_NAME
if [ -z "$PROJECT_NAME" ]; then
    echo -e "${RED}Project name cannot be empty${NC}"
    exit 1
fi

# Prompt for package scope
read -p "Enter your package scope (e.g., mycompany) or press Enter to use 'repo': " PACKAGE_SCOPE
PACKAGE_SCOPE=${PACKAGE_SCOPE:-repo}

# Prompt for author
read -p "Enter author name (or press Enter to skip): " AUTHOR_NAME

# Prompt for description
read -p "Enter project description (or press Enter to skip): " PROJECT_DESC
PROJECT_DESC=${PROJECT_DESC:-"Production-ready TypeScript monorepo"}

echo ""
echo -e "${BLUE}Configuration:${NC}"
echo "  Project Name: $PROJECT_NAME"
echo "  Package Scope: @$PACKAGE_SCOPE"
echo "  Author: ${AUTHOR_NAME:-Not specified}"
echo "  Description: $PROJECT_DESC"
echo ""
read -p "Continue with this configuration? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo -e "${YELLOW}Setup cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}Starting setup...${NC}"
echo ""

# Step 1: Update root package.json
echo -e "${BLUE}[1/8]${NC} Updating root package.json..."
if [ "$(uname)" == "Darwin" ]; then
    # macOS
    sed -i '' "s/\"name\": \"arawn\"/\"name\": \"$PROJECT_NAME\"/" package.json
    sed -i '' "s/\"description\": \".*\"/\"description\": \"$PROJECT_DESC\"/" package.json
    if [ -n "$AUTHOR_NAME" ]; then
        sed -i '' "s/\"author\": \".*\"/\"author\": \"$AUTHOR_NAME\"/" package.json
    fi
else
    # Linux
    sed -i "s/\"name\": \"arawn\"/\"name\": \"$PROJECT_NAME\"/" package.json
    sed -i "s/\"description\": \".*\"/\"description\": \"$PROJECT_DESC\"/" package.json
    if [ -n "$AUTHOR_NAME" ]; then
        sed -i "s/\"author\": \".*\"/\"author\": \"$AUTHOR_NAME\"/" package.json
    fi
fi

# Step 2: Update package names in all package.json files
echo -e "${BLUE}[2/8]${NC} Updating package names..."

update_package_name() {
    local file=$1
    local old_name=$2
    local new_name=$3

    if [ "$(uname)" == "Darwin" ]; then
        sed -i '' "s/\"name\": \"$old_name\"/\"name\": \"$new_name\"/" "$file"
    else
        sed -i "s/\"name\": \"$old_name\"/\"name\": \"$new_name\"/" "$file"
    fi
}

update_package_name "apps/frontend/package.json" "@repo/frontend" "@$PACKAGE_SCOPE/frontend"
update_package_name "apps/backend/package.json" "@repo/backend" "@$PACKAGE_SCOPE/backend"
update_package_name "shared/types/package.json" "@repo/shared-types" "@$PACKAGE_SCOPE/shared-types"
update_package_name "shared/utils/package.json" "@repo/shared-utils" "@$PACKAGE_SCOPE/shared-utils"
update_package_name "shared/config/package.json" "@repo/shared-config" "@$PACKAGE_SCOPE/shared-config"

# Step 3: Update imports in all TypeScript files
echo -e "${BLUE}[3/8]${NC} Updating imports..."

if [ "$PACKAGE_SCOPE" != "repo" ]; then
    if [ "$(uname)" == "Darwin" ]; then
        find . -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/dist/*" -exec sed -i '' "s/@repo\/shared-/@$PACKAGE_SCOPE\/shared-/g" {} +
    else
        find . -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/dist/*" -exec sed -i "s/@repo\/shared-/@$PACKAGE_SCOPE\/shared-/g" {} +
    fi
fi

# Step 4: Update frontend branding
echo -e "${BLUE}[4/8]${NC} Updating frontend branding..."

# Convert project name to title case
PROJECT_TITLE=$(echo "$PROJECT_NAME" | sed -e 's/-/ /g' -e 's/\b\(.\)/\u\1/g')

if [ "$(uname)" == "Darwin" ]; then
    sed -i '' "s/Arawn Monorepo/$PROJECT_TITLE/" apps/frontend/src/app/page.tsx
    sed -i '' "s/title: 'Arawn'/title: '$PROJECT_TITLE'/" apps/frontend/src/app/layout.tsx
    sed -i '' "s/description: 'Production-ready TypeScript monorepo'/description: '$PROJECT_DESC'/" apps/frontend/src/app/layout.tsx
else
    sed -i "s/Arawn Monorepo/$PROJECT_TITLE/" apps/frontend/src/app/page.tsx
    sed -i "s/title: 'Arawn'/title: '$PROJECT_TITLE'/" apps/frontend/src/app/layout.tsx
    sed -i "s/description: 'Production-ready TypeScript monorepo'/description: '$PROJECT_DESC'/" apps/frontend/src/app/layout.tsx
fi

# Step 5: Create .env.local files
echo -e "${BLUE}[5/8]${NC} Creating environment files..."

if [ ! -f "apps/frontend/.env.local" ]; then
    cp apps/frontend/.env.local.example apps/frontend/.env.local
    echo "  Created apps/frontend/.env.local"
fi

if [ ! -f "apps/backend/.env.local" ]; then
    cp apps/backend/.env.local.example apps/backend/.env.local
    echo "  Created apps/backend/.env.local"
fi

# Step 6: Reinitialize git
echo -e "${BLUE}[6/8]${NC} Reinitializing git repository..."
rm -rf .git
git init
git add .
git commit -m "Initial commit: $PROJECT_TITLE" --quiet
echo "  Git repository initialized with initial commit"

# Step 7: Install dependencies
echo -e "${BLUE}[7/8]${NC} Installing dependencies (this may take a minute)..."
pnpm install --silent

# Step 8: Build shared packages
echo -e "${BLUE}[8/8]${NC} Building shared packages..."
pnpm --filter "@$PACKAGE_SCOPE/shared-*" build --silent

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Setup Complete! 🎉                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Your new project is ready!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Configure your environment variables:"
echo "     - apps/frontend/.env.local"
echo "     - apps/backend/.env.local"
echo ""
echo "  2. Start development:"
echo "     ${GREEN}pnpm dev${NC}"
echo ""
echo "  3. Access your apps:"
echo "     - Frontend: ${BLUE}http://localhost:3000${NC}"
echo "     - Backend:  ${BLUE}http://localhost:8080${NC}"
echo ""
echo -e "${YELLOW}Helpful commands:${NC}"
echo "  pnpm build      - Build all packages"
echo "  pnpm typecheck  - Type check all packages"
echo "  pnpm lint       - Lint all packages"
echo ""
echo "Happy coding! 🚀"
