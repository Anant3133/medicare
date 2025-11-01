#!/bin/bash
# db/run_migrations.sh
# Run all SQL migration files in order

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Database connection parameters
DB_NAME=${DB_NAME:-medicare}
DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

echo -e "${YELLOW}===========================================${NC}"
echo -e "${YELLOW}Medicare Database Migration Script${NC}"
echo -e "${YELLOW}===========================================${NC}"
echo ""

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql command not found. Please install PostgreSQL client.${NC}"
    exit 1
fi

# Function to run SQL file
run_sql_file() {
    local file=$1
    local description=$2
    
    echo -e "${YELLOW}Running: ${description}${NC}"
    
    if [ ! -f "$file" ]; then
        echo -e "${RED}Error: File $file not found!${NC}"
        exit 1
    fi
    
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Success: ${description}${NC}"
    else
        echo -e "${RED}✗ Failed: ${description}${NC}"
        echo -e "${RED}Check the error messages above.${NC}"
        exit 1
    fi
    echo ""
}

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the db directory
cd "$SCRIPT_DIR"

echo -e "${YELLOW}Database: $DB_NAME${NC}"
echo -e "${YELLOW}User: $DB_USER${NC}"
echo -e "${YELLOW}Host: $DB_HOST:$DB_PORT${NC}"
echo ""

# Run migrations in order
run_sql_file "schema.sql" "Creating database schema"
run_sql_file "functions.sql" "Creating stored procedures and functions"
run_sql_file "triggers.sql" "Creating triggers"
run_sql_file "indexes_and_views.sql" "Creating indexes and views"
run_sql_file "seed.sql" "Seeding sample data"

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}✓ All migrations completed successfully!${NC}"
echo -e "${GREEN}===========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. cd ../backend && npm install"
echo "2. cd ../frontend && npm install"
echo "3. npm run dev (from root directory)"
echo ""
