#!/bin/bash

# 🔥 Firebase Deployment Script
# This script deploys Firestore rules and indexes to Firebase

set -e  # Exit on error

echo "🔥 Firebase Deployment Script"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI is not installed${NC}"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

echo -e "${GREEN}✅ Firebase CLI found${NC}"
echo ""

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Firebase${NC}"
    echo "Running: firebase login"
    firebase login
fi

echo -e "${GREEN}✅ Authenticated with Firebase${NC}"
echo ""

# Show current project
CURRENT_PROJECT=$(firebase use 2>&1 | grep "Active Project" | awk '{print $NF}' || echo "none")
echo -e "${YELLOW}📋 Current project: ${CURRENT_PROJECT}${NC}"
echo ""

# Ask for confirmation
read -p "Deploy Firestore rules and indexes? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Starting deployment..."
    echo ""
    
    # Deploy Firestore rules
    echo "📝 Deploying Firestore rules..."
    if firebase deploy --only firestore:rules; then
        echo -e "${GREEN}✅ Firestore rules deployed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to deploy Firestore rules${NC}"
        exit 1
    fi
    echo ""
    
    # Deploy Firestore indexes
    echo "📊 Deploying Firestore indexes..."
    if firebase deploy --only firestore:indexes; then
        echo -e "${GREEN}✅ Firestore indexes deployed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to deploy Firestore indexes${NC}"
        exit 1
    fi
    echo ""
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo ""
    echo "⏳ Note: Index creation may take a few minutes."
    echo "   Check status in Firebase Console → Firestore → Indexes"
    echo ""
    echo "🔍 Verify deployment:"
    echo "   1. Go to Firebase Console"
    echo "   2. Check Firestore → Rules (should show updated rules)"
    echo "   3. Check Firestore → Indexes (should show new indexes)"
    echo ""
else
    echo ""
    echo -e "${YELLOW}❌ Deployment cancelled${NC}"
    exit 0
fi
