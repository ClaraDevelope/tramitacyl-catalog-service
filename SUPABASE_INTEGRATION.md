# Supabase Integration for TramitaCyL Scraper

## Overview

The scraper has been enhanced to store data in Supabase as the primary persistence layer, with optional local JSON backup.

## Setup

### 1. Database Setup

Run the migration in your Supabase SQL editor:

```sql
-- Migration for procedures table
CREATE TABLE IF NOT EXISTS procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  source_id TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  url TEXT NOT NULL,
  scope TEXT,
  authority TEXT,
  territory TEXT,
  deadline_text TEXT,
  deadline_date TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  raw JSONB NOT NULL,
  CONSTRAINT unique_source_source_id UNIQUE (source, source_id)
);

-- Function to auto-update updated_at on row updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on row updates
CREATE TRIGGER update_procedures_updated_at 
    BEFORE UPDATE ON procedures 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_procedures_source ON procedures(source);
CREATE INDEX IF NOT EXISTS idx_procedures_deadline_date ON procedures(deadline_date);
CREATE INDEX IF NOT EXISTS idx_procedures_published_at ON procedures(published_at);
CREATE INDEX IF NOT EXISTS idx_procedures_updated_at ON procedures(updated_at);
CREATE INDEX IF NOT EXISTS idx_procedures_authority ON procedures(authority);
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SAVE_LOCAL_JSON=false
```

### 3. Dependencies

Ensure all dependencies are installed:

```bash
npm install
```

## Usage

### Basic Scraping (Supabase only)

```bash
npm run scrape
```

### With JSON Backup

```bash
SAVE_LOCAL_JSON=true npm run scrape
```

### Console Output Only (No Storage)

```bash
npm run scrape -- --output console --no-storage
```

### With Filters

```bash
npm run scrape -- --tipo=subvencion --ambito=cultura
```

## Field Mapping

The scraper maps `Ayuda` objects to `procedures` as follows:

| Ayuda Field | procedures Field | Notes |
|------------|--------------------------|-------|
| id | source_id | Preserves original ID (e.g., "junta-cyl-9af4cccd") |
| titulo | title | - |
| descripcion | summary | Falls back to titulo if null |
| url | url | - |
| tipo | scope | - |
| organismo | authority | - |
| source | source | Hardcoded as "junta_cyl" |
| - | territory | Hardcoded as "Castilla y León" |
| fechaLimite | deadline_date, deadline_text | Parses to ISO, keeps original text |
| fechaPublicacion | published_at | Parses to ISO if possible |
| All fields | raw | Complete original object |

## Error Handling

- **Missing Supabase credentials**: Script exits with code 1
- **Supabase connection failure**: Script exits with code 1  
- **Supabase upsert failure**: Script exits with code 1
- **JSON backup failure** (when `SAVE_LOCAL_JSON=true`): Script exits with code 1

## Batching

Data is processed in batches of 100 items to optimize performance and provide granular error reporting.

## Files Created/Modified

### New Files
- `src/infra/supabaseClient.js` - Supabase REST client implementation
- `src/services/proceduresRepo.js` - Repository layer for database operations
- `.env.example` - Environment variables template


### Modified Files
- `src/index.js` - Added Supabase configuration and error handling
- `src/services/ScrapingService.js` - Integrated Supabase as primary storage
- `package.json` - Downgraded cheerio for Node.js 18 compatibility

## Backward Compatibility

- All existing CLI commands work unchanged
- Local JSON storage works when Supabase is not configured
- Stats command reads from JSON when available
- No breaking changes to existing API