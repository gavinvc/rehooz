#!/usr/bin/env bash
set -e

echo "==> Building React frontend..."
cd frontend
npm run build
cd ..

echo "==> Building Docker image with Cloud Build..."
gcloud builds submit --tag gcr.io/rehoozdb/rehooz-app

echo "==> Deploying to Cloud Run..."
gcloud run deploy rehooz-app \
  --image gcr.io/rehoozdb/rehooz-app \
  --platform managed \
  --region us-east4 \
  --allow-unauthenticated

echo "🎉 Deployment complete!"
