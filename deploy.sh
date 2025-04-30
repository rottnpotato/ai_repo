#!/bin/bash

# AI WordPress Plugin Frontend Deployment Script
# This script builds the Next.js app for static export and prepares it for deployment

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Build for production
echo "🏗️ Building static export..."
npm run build

# 3. Verify output directory exists
if [ ! -d "./out" ]; then
  echo "❌ Build failed: 'out' directory not found"
  exit 1
fi

echo "✅ Build successful!"
echo "📁 Static files are available in the './out' directory"

# 4. Optional: Deploy to your hosting service
# Uncomment and modify the lines below based on your hosting provider

# # Example: Deploy to Netlify
# echo "🚀 Deploying to Netlify..."
# npx netlify deploy --prod --dir=out

# # Example: Deploy to Vercel
# echo "🚀 Deploying to Vercel..."
# npx vercel --prod

# # Example: Deploy to GitHub Pages
# echo "🚀 Deploying to GitHub Pages..."
# npx gh-pages -d out

echo "✨ Deployment preparation complete!"
echo "To manually deploy, upload the contents of the 'out' directory to your hosting service." 