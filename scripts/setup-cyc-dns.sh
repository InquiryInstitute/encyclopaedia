#!/bin/bash
# Setup DNS for cyc.inquiry.institute subdomain

set -e

echo "🌐 Setting up DNS for cyc.inquiry.institute..."

# Get the hosted zone ID for inquiry.institute
ZONE_ID=$(aws route53 list-hosted-zones \
  --query "HostedZones[?Name=='inquiry.institute.'].Id" \
  --output text | sed 's|/hostedzone/||')

if [ -z "$ZONE_ID" ]; then
  echo "❌ Error: Could not find hosted zone for inquiry.institute"
  echo "   Make sure AWS CLI is configured and the hosted zone exists."
  exit 1
fi

echo "✓ Found hosted zone: $ZONE_ID"

# Check if record already exists
EXISTING=$(aws route53 list-resource-record-sets \
  --hosted-zone-id "$ZONE_ID" \
  --query "ResourceRecordSets[?Name=='cyc.inquiry.institute.'].Type" \
  --output text)

if [ -n "$EXISTING" ]; then
  echo "⚠️  Record for cyc.inquiry.institute already exists (type: $EXISTING)"
  echo "   Updating existing record..."
fi

# Create/update CNAME record for cyc subdomain
echo "📝 Creating/updating CNAME record..."

aws route53 change-resource-record-sets \
  --hosted-zone-id "$ZONE_ID" \
  --change-batch '{
    "Comment": "Add cyc subdomain for Encyclopaedia",
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "cyc.inquiry.institute",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [
          {"Value": "inquiry-institute.github.io"}
        ]
      }
    }]
  }' > /dev/null

echo "✓ DNS record created/updated"

# Wait and verify
echo ""
echo "⏳ Waiting 10 seconds for propagation..."
sleep 10

echo ""
echo "🔍 Verifying DNS resolution..."
dig cyc.inquiry.institute +short || echo "(DNS may take time to propagate)"

echo ""
echo "✅ DNS setup complete!"
echo ""
echo "Next steps:"
echo "1. Wait for DNS propagation (up to 48 hours, usually much faster)"
echo "2. Push encyclopaedia to GitHub: git push origin main"
echo "3. Enable GitHub Pages in repository settings"
echo "4. Set custom domain to: cyc.inquiry.institute"
echo "5. Enable HTTPS enforcement after DNS propagates"
echo ""
echo "Test: https://cyc.inquiry.institute"
