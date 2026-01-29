# Deploy Encyclopædia to cyc.inquiry.institute

This guide covers setting up the `cyc.inquiry.institute` subdomain for The Encyclopædia.

## Why "cyc"?

- Short for "encyclopædia" (the original Greek κύκλος / kyklos meaning "circle" of knowledge)
- Easy to remember: `cyc.inquiry.institute`
- Avoids URL encoding issues with special characters

---

## Step 1: Add DNS Record in Route 53

### Via AWS CLI

```bash
# Get your hosted zone ID first
ZONE_ID=$(aws route53 list-hosted-zones \
  --query "HostedZones[?Name=='inquiry.institute.'].Id" \
  --output text | sed 's|/hostedzone/||')

echo "Zone ID: $ZONE_ID"

# Add CNAME record for cyc subdomain pointing to GitHub Pages
aws route53 change-resource-record-sets \
  --hosted-zone-id "$ZONE_ID" \
  --change-batch '{
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
  }'
```

### Via AWS Console

1. Go to **Route 53** → **Hosted zones** → **inquiry.institute**
2. Click **Create record**
3. Configure:
   - **Record name**: `cyc`
   - **Record type**: `CNAME`
   - **Value**: `inquiry-institute.github.io`
   - **TTL**: 300
4. Click **Create records**

---

## Step 2: Create GitHub Repository

### Option A: Separate Repository (Recommended)

Create a new repo `InquiryInstitute/encyclopaedia` and push the encyclopaedia content:

```bash
cd /Users/danielmcshan/GitHub/Inquiry.Institute/encyclopaedia

# Initialize as a git repo (if not already)
git init
git remote add origin git@github.com:InquiryInstitute/encyclopaedia.git

# Push to GitHub
git add .
git commit -m "Initial encyclopaedia structure with all 12 volumes"
git push -u origin main
```

### Option B: Subdirectory in Existing Repo

If keeping in the main `Inquiry.Institute` repo, the GitHub Actions workflow will deploy from the `encyclopaedia/site/` directory.

---

## Step 3: Configure GitHub Pages

### In GitHub Repository Settings

1. Go to **Settings** → **Pages**
2. **Source**: Deploy from a branch (or GitHub Actions)
3. **Custom domain**: `cyc.inquiry.institute`
4. **Enforce HTTPS**: ✓ (enable after DNS propagates)

### Add CNAME File

Create `encyclopaedia/site/public/CNAME`:

```
cyc.inquiry.institute
```

---

## Step 4: Update Astro Configuration

Update `encyclopaedia/site/astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://cyc.inquiry.institute',
  base: '/',  // Root path since we have a dedicated subdomain
  output: 'static',
});
```

---

## Step 5: Update GitHub Actions Workflows

### `encyclopaedia/.github/workflows/deploy-site.yml`

Ensure the workflow includes:

```yaml
- name: Setup Pages
  uses: actions/configure-pages@v5
  with:
    static_site_generator: astro

- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: site/dist

- name: Deploy to GitHub Pages
  id: deployment
  uses: actions/deploy-pages@v4
```

---

## Step 6: Verify DNS Propagation

```bash
# Check DNS resolution
dig cyc.inquiry.institute

# Expected output should show CNAME pointing to inquiry-institute.github.io
# Then A records for GitHub Pages IPs:
# 185.199.108.153
# 185.199.109.153
# 185.199.110.153
# 185.199.111.153

# Test from different DNS servers
dig cyc.inquiry.institute @8.8.8.8
dig cyc.inquiry.institute @1.1.1.1
```

---

## Step 7: Test the Site

After DNS propagates (can take up to 48 hours, usually much faster):

1. Visit https://cyc.inquiry.institute
2. Verify SSL certificate is valid
3. Test navigation between volumes
4. Test PDF viewer (when implemented)

---

## Directory Structure After Setup

```
encyclopaedia/
├── editions/
│   ├── adult/volumes/volume-01-mind/...
│   └── children/volumes/volume-01-mind/...
├── shared/
├── site/
│   ├── astro.config.mjs      # Updated with cyc.inquiry.institute
│   ├── package.json
│   ├── public/
│   │   ├── CNAME            # cyc.inquiry.institute
│   │   └── builds/          # HTML + PDFs
│   └── src/
│       ├── pages/
│       └── components/
├── scripts/
├── .github/workflows/
│   ├── build-content.yml
│   └── deploy-site.yml
├── README.md
├── VOLUMES.md
├── TODO.md
└── DEPLOY_CYC_SUBDOMAIN.md  # This file
```

---

## Troubleshooting

### DNS Not Resolving

1. Wait for propagation (up to 48 hours)
2. Clear local DNS cache: `sudo dscacheutil -flushcache` (macOS)
3. Check Route 53 records are correct

### HTTPS Not Working

1. Ensure DNS is fully propagated first
2. In GitHub Pages settings, uncheck then re-check "Enforce HTTPS"
3. GitHub auto-provisions SSL certificates (can take ~15 minutes)

### 404 Errors

1. Verify CNAME file exists in `site/public/CNAME`
2. Check Astro `base` path is `/` (not `/encyclopaedia`)
3. Verify build artifacts are being deployed correctly

---

## Alternative: Use Netlify or Vercel

If GitHub Pages proves difficult:

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd encyclopaedia/site
npm run build
netlify deploy --prod --dir=dist
```

Then set custom domain in Netlify dashboard.

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd encyclopaedia/site
vercel --prod
```

Then set custom domain in Vercel dashboard.

---

## Quick Commands

```bash
# Check current DNS
dig cyc.inquiry.institute

# Build site locally
cd encyclopaedia/site && npm run build

# Preview locally
cd encyclopaedia/site && npm run preview

# Deploy via GitHub (push to main)
git add . && git commit -m "Update encyclopaedia" && git push
```

---

**Created**: January 29, 2026  
**Subdomain**: cyc.inquiry.institute  
**Repository**: InquiryInstitute/encyclopaedia
