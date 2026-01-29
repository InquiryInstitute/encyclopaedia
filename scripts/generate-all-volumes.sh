#!/bin/bash
set -euo pipefail

# Generate all articles for all volumes with peer review workflow
# Pushes after each volume completes

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

# Check for required environment variables
if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
  exit 1
fi

# Function to get volume slug
get_volume_slug() {
  case "$1" in
    1) echo "mind" ;;
    2) echo "language-meaning" ;;
    3) echo "nature" ;;
    4) echo "measure" ;;
    5) echo "society" ;;
    6) echo "art-form" ;;
    7) echo "knowledge" ;;
    8) echo "history" ;;
    9) echo "ethics" ;;
    10) echo "machines" ;;
    11) echo "futures" ;;
    12) echo "limits" ;;
    *) echo "unknown" ;;
  esac
}

# Function to find entries for a volume
find_entries() {
  local volume=$1
  local edition=$2
  local vol_num=$(printf "%02d" "$volume")
  local vol_slug="volume-${vol_num}-$(get_volume_slug $volume)"
  local entries_dir="$REPO_ROOT/editions/$edition/volumes/$vol_slug/entries"
  
  if [ ! -d "$entries_dir" ]; then
    return
  fi
  
  find "$entries_dir" -name "*.adoc" -type f | while read -r file; do
    # Check if file has placeholder
    if grep -q "\[CANONICAL TEXT TO BE GENERATED\]" "$file"; then
      # Extract metadata
      local slug=$(basename "$file" .adoc)
      local faculty_id=$(grep -E "^:faculty-id:" "$file" | head -1 | sed 's/^:faculty-id: *//' | tr -d ' ')
      local author=$(grep -E "^:canonical-author:" "$file" | head -1 | sed 's/^:canonical-author: *//' | tr -d ' ')
      local entry_type=$(grep -E "^:entry-type:" "$file" | head -1 | sed 's/^:entry-type: *//' | tr -d ' ' || echo "standard")
      
      if [ -n "$faculty_id" ] && [ -n "$author" ]; then
        echo "$slug|$faculty_id|$author|$entry_type|$file"
      fi
    fi
  done
}

# Function to generate article
generate_article() {
  local slug=$1
  local faculty=$2
  local edition=$3
  local volume=$4
  local type=$5
  
  echo ""
  echo "📝 Generating: $slug by $faculty"
  
  # Use npx tsx to run TypeScript scripts
  npx tsx "$SCRIPT_DIR/generate-with-review.ts" \
    --entry "$slug" \
    --faculty "$faculty" \
    --edition "$edition" \
    --volume "$volume" \
    --type "$type" || return 1
}

# Function to push to git
push_to_git() {
  local volume=$1
  local edition=$2
  
  echo ""
  echo "📤 Pushing Volume $volume ($edition) to git..."
  
  git add -A
  git commit -m "📚 Generate Volume $volume articles ($edition)" || true
  git push origin main || echo "⚠️  Git push failed"
  
  echo "✅ Pushed Volume $volume ($edition)"
}

# Parse arguments
TARGET_VOLUME=""
TARGET_EDITION="both"

while [[ $# -gt 0 ]]; do
  case $1 in
    --volume)
      TARGET_VOLUME="$2"
      shift 2
      ;;
    --edition)
      TARGET_EDITION="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Determine volumes and editions
if [ -n "$TARGET_VOLUME" ]; then
  VOLUMES=("$TARGET_VOLUME")
else
  VOLUMES=(1 2 3 4 5 6 7 8 9 10 11 12)
fi

if [ "$TARGET_EDITION" = "both" ]; then
  EDITIONS=("adult" "children")
else
  EDITIONS=("$TARGET_EDITION")
fi

echo "📚 Generating all articles for volumes: ${VOLUMES[*]}"
echo "📖 Editions: ${EDITIONS[*]}"
echo ""

for volume in "${VOLUMES[@]}"; do
  echo ""
  echo "============================================================"
  echo "📖 VOLUME $volume: $(get_volume_slug $volume | tr '[:lower:]' '[:upper:]')"
  echo "============================================================"
  
  for edition in "${EDITIONS[@]}"; do
    echo ""
    echo "📚 ${edition^^} EDITION"
    
    # Find all entries
    entries=$(find_entries "$volume" "$edition")
    
    if [ -z "$entries" ]; then
      echo "No entries found for Volume $volume ($edition)"
      continue
    fi
    
    entry_count=$(echo "$entries" | wc -l | tr -d ' ')
    echo "Found $entry_count entries to generate"
    echo ""
    
    success_count=0
    fail_count=0
    
    # Process each entry
    while IFS='|' read -r slug faculty_id author entry_type file_path; do
      if generate_article "$slug" "$faculty_id" "$edition" "$volume" "$entry_type"; then
        ((success_count++))
      else
        ((fail_count++))
      fi
      
      # Small delay between articles
      sleep 2
    done <<< "$entries"
    
    echo ""
    echo "✅ Volume $volume ($edition): $success_count generated, $fail_count failed"
    
    # Push after each volume/edition
    push_to_git "$volume" "$edition"
    
    # Delay before next edition
    sleep 3
  done
done

echo ""
echo "🎉 All volumes processed!"
