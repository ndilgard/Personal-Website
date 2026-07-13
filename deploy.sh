#!/bin/bash
set -e

STACK_NAME="nate-dilgard-website"
BUCKET="nate-dilgard-website"
REGION="us-east-1"
TEMPLATE="$(dirname "$0")/infrastructure.yaml"
SITE_DIR="$(dirname "$0")"

echo "=== Nate Dilgard Website Deploy ==="

# --- Step 1: Create or update the CloudFormation stack ---
STACK_STATUS=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query 'Stacks[0].StackStatus' \
  --output text 2>/dev/null || echo "DOES_NOT_EXIST")

if [ "$STACK_STATUS" = "DOES_NOT_EXIST" ]; then
  echo "[1/3] Creating CloudFormation stack..."
  aws cloudformation create-stack \
    --stack-name "$STACK_NAME" \
    --template-body "file://$TEMPLATE" \
    --region "$REGION"

  echo "      Waiting for stack creation to complete (this takes ~2 min)..."
  aws cloudformation wait stack-create-complete \
    --stack-name "$STACK_NAME" \
    --region "$REGION"
  echo "      Stack created."

else
  echo "[1/3] Stack exists (status: $STACK_STATUS). Updating..."
  UPDATE_OUTPUT=$(aws cloudformation update-stack \
    --stack-name "$STACK_NAME" \
    --template-body "file://$TEMPLATE" \
    --region "$REGION" 2>&1 || true)

  if echo "$UPDATE_OUTPUT" | grep -q "No updates are to be performed"; then
    echo "      Infrastructure unchanged, skipping update."
  else
    echo "      Waiting for stack update to complete..."
    aws cloudformation wait stack-update-complete \
      --stack-name "$STACK_NAME" \
      --region "$REGION"
    echo "      Stack updated."
  fi
fi

# --- Step 2: Sync site files to S3 ---
echo "[2/3] Uploading site files to S3..."
aws s3 sync "$SITE_DIR" "s3://$BUCKET" \
  --region "$REGION" \
  --exclude "*.sh" \
  --exclude "*.yaml" \
  --exclude "CLAUDE.md" \
  --exclude "Files/Color_Scheme.png" \
  --exclude "Files/Nathan_Dilgard_Resume.docx" \
  --exclude "Files/Profile.pdf" \
  --delete

# --- Step 3: Invalidate CloudFront cache so changes go live immediately ---
echo "[3/3] Clearing CloudFront cache..."
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
  --output text)

aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*" \
  --region "$REGION" > /dev/null

# --- Done ---
SITE_URL=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontURL`].OutputValue' \
  --output text)

echo ""
echo "=== Deploy complete! ==="
echo "Site URL: $SITE_URL"
echo "(New sites take ~10 min for CloudFront to fully propagate)"
