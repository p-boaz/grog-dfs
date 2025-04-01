# MLB API Data Capture Guide

This guide explains how to capture real MLB API responses to analyze the actual data shapes for rebuilding the type system.

## Overview

The goal is to extract actual API response shapes instead of guessing or relying on outdated documentation. This approach ensures that our types match reality and cover all fields needed by the application.

## Step-by-Step Process

### 1. Instrument the API Client

We've created a script that temporarily instruments the MLB API client to capture responses:

```bash
pnpm tsx scripts/capture-api-samples.ts
```

This script will:

1. Create a backup of your API client
2. Add response capture functionality
3. Run sample API calls
4. Process and analyze the responses
5. Restore your API client to its original state

### 2. Simulate Key Application Flows

For more comprehensive coverage, we've created a flow simulator:

```bash
pnpm tsx scripts/sample-flows.ts
```

This script simulates three key application flows:

- Daily schedule retrieval and game environment data
- Player statistics (batters and pitchers)
- DFS analysis calculations (projections, probabilities, etc.)

### 3. Analyze the Results

After running the capture scripts, you'll find these files in `/data/api-samples/`:

- `api-responses.md` - Documentation of all captured responses
- `api-types.ts` - Auto-generated TypeScript interfaces matching the API shapes
- Individual JSON files containing each response

### 4. Compare with Current Types

Use the analysis tool to find mismatches between current types and actual data:

```bash
pnpm tsx scripts/analyze-type-usage.ts
```

This will generate a report highlighting:

- Properties in types that don't exist in actual data
- Properties in actual data missing from the types
- Type mismatches between definition and reality

## Advanced Usage

### Custom API Call Capture

You can add your own API calls to `scripts/sample-flows.ts` to capture specific endpoints:

```typescript
// Add to the appropriate flow function
const customResponse = await yourApiFunction({
  param1: value1,
  param2: value2,
});
```

### Long-Term API Monitoring

For ongoing type validation, consider:

1. Running these scripts periodically to detect API changes
2. Implementing runtime type guards that validate responses
3. Setting up alerts if API shapes change unexpectedly

## Troubleshooting

### Common Issues

1. **Permission errors**: Make sure you have write access to the data directory
2. **API errors**: Check if the MLB API is accessible and responding correctly
3. **Missing client file**: Verify the path to `api-client.ts` is correct

### If Capture Fails

If the capture process is interrupted:

1. Run `pnpm tsx scripts/restore-api-client.ts` to restore the original client
2. Check error logs for specific failure points
3. Try capturing individual endpoints manually

## Next Steps

Once you have captured the API data:

1. Run the type analysis tool to find discrepancies
2. Start implementing the updated types based on actual shapes
3. Create adapters for incompatible interfaces
4. Gradually migrate modules to use the new types
