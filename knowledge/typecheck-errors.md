# Common Typecheck Errors and Solutions

This document catalogs common TypeScript errors you might encounter in this codebase and provides guidance on how to solve them.

## 1. Type Inconsistencies and Missing Type Definitions

### Problem: Function name mismatch in imports

```typescript
// Error example:
error TS2724: '"./run-production"' has no exported member named 'calculateRunProductionProjection'.
Did you mean 'calculateRunProductionPoints'?
```

**Solution:**
- Always check that imported function names match the exported function names exactly
- If you rename a function, use search tools to find all references and update them
- Consider using barrel files (index.ts) to centralize exports for stable API

### Problem: Module path errors

```typescript
// Error example:
error TS2307: Cannot find module '../types/analysis/ballpark-factors'
```

**Solution:**
- Verify the file path exists and is correct
- Check for typos in the import path
- Consult `/lib/mlb/types/index.ts` for the correct path
- Use centralized imports from index files where possible

### Problem: Missing properties in type definitions

```typescript
// Error example:
error TS2353: Object literal may only specify known properties, and 'singles' does not exist in type 'BallparkHitFactor'.
```

**Solution:**
- Reference the interface definition to confirm required properties
- Add missing properties to the interface if needed
- Use property spreading (`...object`) to handle extra properties
- Consider using Partial<Type> for partial implementations

## 2. Interface Conflicts and Type Mismatches

### Problem: Properties don't exist on types

```typescript
// Error example:
error TS2339: Property 'onBasePct' does not exist on type 'TeamStats'.
```

**Solution:**
- Check the property naming convention in the interface definition
- Use appropriate mapping or transformation to match property names
- Consider adding type adapters for legacy APIs
- Access properties safely with optional chaining and defaults:
  ```typescript
  const onBasePercentage = (teamStats?.hitting?.obp as number) || 0.33;
  ```

### Problem: Function parameter count mismatches

```typescript
// Error example:
error TS2554: Expected 1 arguments, but got 2.
```

**Solution:**
- Review function signatures carefully
- Check API documentation for expected parameters
- Consolidate parameters into objects for more flexible APIs
- Consider using optional parameters with defaults

### Problem: Undefined interface name

```typescript
// Error example:
error TS2552: Cannot find name 'RunProductionPoints'.
```

**Solution:**
- Import the missing interface from the appropriate module
- Define the interface if it doesn't exist yet
- Check for typos in interface names
- Ensure the interface is properly exported from its module

## 3. Complex Type Issues

### Problem: Object property restrictions

```typescript
// Error example:
Object literal may only specify known properties, and 'sprintSpeed' does not exist in type 'PlayerSBSeasonStats'.
```

**Solution:**
- Add the missing property to the interface definition
- Make the property optional in the interface
- Consider using index signatures for flexible objects
- Use type assertions cautiously when necessary

### Problem: Interface implementation is incomplete

```typescript
// Error example:
Type is missing the following properties: batterProfile, pitcherHold, gameContext, sprintSpeed
```

**Solution:**
- Implement all required properties from the interface
- Consider creating factory functions that ensure complete objects
- Use interface composition to separate core from extended properties
- Add default values for all required properties:
  ```typescript
  factors: {
    batterSpeed: 5.0,
    batterTendency: 5.0,
    catcherDefense: 5.0,
    pitcherHoldRate: 5.0,
    gameScriptFactor: 5.0,
    batterProfile: 5.0, // Add missing properties
    pitcherHold: 5.0,
    gameContext: 5.0,
    sprintSpeed: 27.0
  }
  ```

### Problem: Missing required properties in arrays

```typescript
// Error example:
Type '{ ... }[]' is not assignable to type 'PitcherCareerStatsSeason[]'.
Property 'hits' is missing in type '{ ... }' but required in type 'PitcherCareerStatsSeason'.
```

**Solution:**
- Map array items to include all required properties
- Add default values for missing properties
- Consider making problematic properties optional
- Transform data before returning:
  ```typescript
  careerStats: careerStats.map(stat => ({
    ...stat,
    hits: 0 // Add required property with default value
  }))
  ```

## 4. Import and Export Conflicts

### Problem: Name conflicts in imports

```typescript
// Error example:
error TS2440: Import declaration conflicts with local declaration of 'TeamStats'.
```

**Solution:**
- Use named imports with aliases:
  ```typescript
  import { TeamStats as CoreTeamStats } from "./core";
  ```
- Create wrapper interfaces that extend the conflicting types
- Use namespaces to isolate conflicting types
- Refactor to eliminate the duplicate type definitions

### Problem: Re-export ambiguity

```typescript
// Error example:
error TS2308: Module './core' has already exported a member named 'TeamStats'. 
Consider explicitly re-exporting to resolve the ambiguity.
```

**Solution:**
- Explicitly re-export types with unique names:
  ```typescript
  export { TeamStats as GameTeamStats } from './game';
  ```
- Selectively re-export specific types rather than using wildcard exports
- Create wrapper interfaces for conflicting types
- Use explicit named imports instead of relying on wildcard re-exports

## Best Practices to Prevent TypeScript Errors

1. **Define clear interface contracts** with all required properties
2. **Use consistent naming conventions** across related interfaces
3. **Add factory functions** for complex object creation
4. **Include JSDoc documentation** for all interfaces and properties
5. **Use type guards** to safely handle type unions
6. **Implement runtime validation** for external data
7. **Review dependencies** before changing interfaces
8. **Set up automated typecheck** in your workflow
9. **Consider using type composition** rather than inheritance
10. **Use exhaustive testing** to catch type errors early