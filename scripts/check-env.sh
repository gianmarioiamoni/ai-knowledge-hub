#!/bin/bash

# Script to check if all required environment variables are set
# Run this before deploying to Vercel

echo "🔍 Checking Environment Variables for Production..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
MISSING=0
OPTIONAL_MISSING=0

# Function to check env var
check_var() {
    local var_name=$1
    local is_optional=$2
    
    if [ -z "${!var_name}" ]; then
        if [ "$is_optional" = "optional" ]; then
            echo -e "${YELLOW}⚠️  $var_name${NC} (optional - not set)"
            ((OPTIONAL_MISSING++))
        else
            echo -e "${RED}❌ $var_name${NC} (REQUIRED - missing)"
            ((MISSING++))
        fi
    else
        # Mask sensitive values
        local masked_value="${!var_name}"
        if [[ ${#masked_value} -gt 20 ]]; then
            masked_value="${masked_value:0:10}...${masked_value: -10}"
        fi
        echo -e "${GREEN}✅ $var_name${NC}: $masked_value"
    fi
}

echo "📋 REQUIRED VARIABLES:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_var "NEXT_PUBLIC_SUPABASE_URL"
check_var "NEXT_PUBLIC_SUPABASE_ANON_KEY"
check_var "SUPABASE_SERVICE_ROLE_KEY"
check_var "OPENAI_API_KEY"
check_var "STRIPE_SECRET_KEY"
check_var "STRIPE_WEBHOOK_SECRET"
check_var "STRIPE_PRICE_SMB_MONTHLY"
check_var "STRIPE_PRICE_SMB_ANNUAL"
check_var "STRIPE_PRICE_ENTERPRISE_MONTHLY"
check_var "STRIPE_PRICE_ENTERPRISE_ANNUAL"

echo ""
echo "📧 EMAIL CONFIGURATION (at least one set required):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Gmail OR SMTP is configured
if [ -z "$GMAIL_USER" ] && [ -z "$SMTP_HOST" ]; then
    echo -e "${RED}❌ Email not configured${NC} (need either Gmail or SMTP)"
    ((MISSING++))
else
    if [ -n "$GMAIL_USER" ]; then
        echo "Using Gmail configuration:"
        check_var "GMAIL_USER"
        check_var "GMAIL_APP_PASSWORD"
    fi
    
    if [ -n "$SMTP_HOST" ]; then
        echo "Using SMTP configuration:"
        check_var "SMTP_HOST"
        check_var "SMTP_PORT"
        check_var "SMTP_USER"
        check_var "SMTP_PASSWORD"
        check_var "SMTP_FROM"
    fi
fi

echo ""
echo "👤 OPTIONAL (but recommended):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_var "ADMIN_EMAIL" "optional"
check_var "SUPERADMIN_EMAIL" "optional"
check_var "SUPERADMIN_PASSWORD" "optional"
check_var "SUPERADMIN_NAME" "optional"
check_var "DEMO_USER_EMAIL" "optional"
check_var "DEMO_USER_PASSWORD" "optional"
check_var "DEMO_USER_NAME" "optional"
check_var "CRON_SECRET" "optional"
check_var "SENTRY_DSN" "optional"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $MISSING -eq 0 ]; then
    echo -e "${GREEN}✅ All required environment variables are set!${NC}"
    echo ""
    if [ $OPTIONAL_MISSING -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $OPTIONAL_MISSING optional variables not set${NC}"
        echo ""
    fi
    echo "🚀 You're ready to deploy to Vercel!"
    echo ""
    echo "Next steps:"
    echo "1. Go to https://vercel.com"
    echo "2. Import your repository"
    echo "3. Copy these env vars to Vercel Settings → Environment Variables"
    echo "4. Deploy!"
    exit 0
else
    echo -e "${RED}❌ $MISSING required environment variables are missing!${NC}"
    echo ""
    echo "Please set them in your .env.local file and in Vercel."
    echo ""
    echo "See DEPLOYMENT_GUIDE.md for detailed instructions."
    exit 1
fi


