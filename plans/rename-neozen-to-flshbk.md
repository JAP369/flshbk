# Plan: Rename 'neozen' to 'flshbk'

## Overview
Update all instances of the name 'neozen' (and 'NeoZen') to 'flshbk' (and 'Flshbk') across the application context.

## Files to Modify

### 1. `package.json`
- **Line 2**: Change `"name": "neozen"` to `"name": "flshbk"`

### 2. `package-lock.json`
- **Line 2**: Change `"name": "neozen"` to `"name": "flshbk"`
- **Line 8**: Change `"name": "neozen"` to `"name": "flshbk"` (inside the `""` package definition)

### 3. `app/layout.tsx`
- **Line 19**: Change `title: "NeoZen — Collector's Trading Portal"` to `title: "Flshbk — Collector's Trading Portal"`
- **Line 22**: Change `applicationName: "NeoZen"` to `applicationName: "Flshbk"`

### 4. `app/page.tsx`
- **Line 216**: Change `What is NeoZen?` to `What is Flshbk?`

## Notes
- `node_modules/.package-lock.json` will be regenerated automatically and does not need manual editing.
- No other source files (components, contexts, etc.) contain references to 'neozen' or 'NeoZen'.
