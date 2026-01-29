#!/bin/bash
# Monitor article generation progress

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="/tmp/generate-articles.log"

echo "📊 Article Generation Monitor"
echo "=============================="
echo ""

# Check if process is running
if pgrep -f "generate-all-volumes.sh" > /dev/null; then
  echo "✅ Generation process is running"
  echo ""
else
  echo "⚠️  Generation process not found"
  echo ""
fi

# Show recent log
if [ -f "$LOG_FILE" ]; then
  echo "📝 Recent activity (last 20 lines):"
  echo "-----------------------------------"
  tail -20 "$LOG_FILE"
  echo ""
else
  echo "📝 Log file not found: $LOG_FILE"
  echo ""
fi

# Count remaining entries
echo "📊 Progress:"
echo "-----------------------------------"
TOTAL_REMAINING=$(find "$REPO_ROOT/editions" -name "*.adoc" -exec grep -l "\[CANONICAL TEXT TO BE GENERATED\]" {} \; 2>/dev/null | wc -l | xargs)
echo "Entries remaining: $TOTAL_REMAINING"

# Count by volume
for vol in {1..12}; do
  vol_num=$(printf "%02d" "$vol")
  adult_count=$(find "$REPO_ROOT/editions/adult/volumes/volume-${vol_num}-"* -name "*.adoc" -exec grep -l "\[CANONICAL TEXT TO BE GENERATED\]" {} \; 2>/dev/null | wc -l | xargs)
  children_count=$(find "$REPO_ROOT/editions/children/volumes/volume-${vol_num}-"* -name "*.adoc" -exec grep -l "\[CANONICAL TEXT TO BE GENERATED\]" {} \; 2>/dev/null | wc -l | xargs)
  if [ "$adult_count" -gt 0 ] || [ "$children_count" -gt 0 ]; then
    echo "  Volume $vol: Adult=$adult_count, Children=$children_count"
  fi
done

echo ""
echo "💡 To watch live: tail -f $LOG_FILE"
