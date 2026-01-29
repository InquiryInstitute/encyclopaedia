# Encyclopædia Generation Scripts

## generate-volume-01.ts

Generates all Volume I (Mind) entries using the `ask-faculty` edge function.

### Prerequisites

Set environment variables:
```bash
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
# OR
export SUPABASE_URL="https://your-project.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### Usage

Generate all entries for both editions:
```bash
tsx scripts/generate-volume-01.ts
```

Generate for specific edition:
```bash
tsx scripts/generate-volume-01.ts --edition adult
tsx scripts/generate-volume-01.ts --edition children
```

Generate a specific entry:
```bash
tsx scripts/generate-volume-01.ts --entry attention
tsx scripts/generate-volume-01.ts --edition adult --entry attention
```

### What it does

1. Reads all entry `.adoc` files from Volume I
2. Extracts metadata (faculty-id, entry-type, topics, etc.)
3. Calls `ask-faculty` edge function to generate canonical content
4. Updates the entry files with generated content
5. Preserves existing metadata and marginalia

### Entry Types

- **Major**: 4000-6000 words (adult), 750-1500 words (children)
- **Standard**: 2000-3000 words (adult), 500-1000 words (children)
- **Boundary**: 3000-4000 words (adult), 750-1250 words (children)
- **Closing**: 1000-2000 words (adult), 250-500 words (children)
