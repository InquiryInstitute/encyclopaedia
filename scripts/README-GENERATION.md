# Article Generation Guide

## Prerequisites

1. **Environment Variables** (required):
   ```bash
   export SUPABASE_URL="https://your-project.supabase.co"
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   export OPENROUTER_API_KEY="your-openrouter-key"  # Optional, for voice fidelity checks
   ```

2. **Dependencies**:
   - Node.js (v18+)
   - npx (comes with npm)

## Generate All Articles

### Generate all volumes (both editions):
```bash
./scripts/generate-all-volumes.sh
```

### Generate specific volume:
```bash
./scripts/generate-all-volumes.sh --volume 1
```

### Generate specific volume and edition:
```bash
./scripts/generate-all-volumes.sh --volume 1 --edition adult
```

### Generate single article:
```bash
npx tsx scripts/generate-with-review.ts \
  --entry attention \
  --faculty a.james \
  --edition adult \
  --volume 1 \
  --type major
```

## Workflow

The generation script:
1. Finds all entry files with `[CANONICAL TEXT TO BE GENERATED]` placeholder
2. For each entry:
   - Generates initial article using `ask-faculty`
   - Checks voice fidelity
   - Selects two reviewers
   - Generates review feedback
   - Revises article based on feedback
   - Generates marginalia from reviewers
   - Updates entry file with canonical text and marginalia
3. Pushes to git after each volume/edition completes

## Notes

- Articles are generated with peer review workflow
- Voice fidelity is checked at each stage
- Marginalia are automatically generated from reviewers
- Script pushes to git after each volume to preserve progress
- Rate limiting is built in (2 second delay between articles)

## Troubleshooting

**Error: SUPABASE_URL not set**
- Export the required environment variables before running

**Error: tsx not found**
- The script uses `npx tsx` which should work if Node.js is installed
- If issues persist, install tsx: `npm install -g tsx`

**Generation fails for specific article**
- Check that the faculty member exists in Supabase
- Verify the entry file has correct metadata
- Check network connectivity to Supabase
