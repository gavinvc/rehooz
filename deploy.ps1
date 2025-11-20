Write-Host "==== ReHooz Deployment Started ====" -ForegroundColor Cyan

# Build the React frontend
Write-Host "`n[1/4] Building React frontend..." -ForegroundColor Yellow
Set-Location "./frontend"
npm install
npm run build
Set-Location ".."

# Submit Docker build to Google Cloud
Write-Host "`n[2/4] Submitting image to Google Cloud Build..." -ForegroundColor Yellow
gcloud builds submit --tag "gcr.io/rehoozdb/rehooz-app"

# Deploy to Cloud Run
Write-Host "`n[3/4] Deploying to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy "rehooz-app" `
  --image "gcr.io/rehoozdb/rehooz-app" `
  --platform "managed" `
  --region "us-east4" `
  --allow-unauthenticated

Write-Host "`n[4/4] Deployment Complete!" -ForegroundColor Green
