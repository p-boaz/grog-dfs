# MLB DFS Type System Rebuild Implementation Plan

Based on analysis of actual API responses and type usage patterns, this document outlines the implementation plan for rebuilding the type system.

## Key Insights from Analysis

1. **API vs Types Mismatches**:
   - Several interfaces have property names that don't match actual API responses
   - Nested objects in API responses often have more complex structures than types
   - API responses use string representations for some numeric values (e.g., batting averages)

2. **Type Definition Issues**:
   - Many interfaces have unused properties defined but not used in code
   - Code often accesses properties not defined in interfaces
   - Excessive number of interfaces with overlapping responsibilities
   - Circular dependencies between type modules

3. **Implementation Patterns**:
   - Many functions use property access without null checks
   - Default values are applied inconsistently
   - Type assertions are used excessively to bypass type checking

## Implementation Strategy

### Phase 1: Core API Types (First Implementation)

Create accurate base types that match the actual API response structure:

1. **Create API Response Types**:
   - Define interfaces for direct API responses
   - Use exact property names from the API
   - Add proper JSDoc documentation
   - Place in `/lib/mlb/types/api/` directory

2. **Define Domain Model Types**:
   - Create normalized domain models built on API types
   - Add proper type guards and validators
   - Ensure consistency with real data

### Phase 2: Type Composition and Adapters

Implement a layered type approach:

1. **Base Layer**: Raw API types (exact match to API responses)
2. **Domain Layer**: Validated and normalized domain models
3. **Analysis Layer**: Types specific to analysis functions
4. **View Layer**: Types for UI components

### Phase 3: Gradual Migration Strategy

1. Begin with core modules that others depend on
2. Use adapter functions for backward compatibility
3. Update one module at a time with comprehensive tests
4. Add runtime validation at API boundaries

## Implementation Details

### Core API Types

Based on captured responses, here are the core API types to implement first:

1. **Batter API Types**:
   - Raw batter data from API
   - Season stats structure
   - Career stats array format

2. **Pitcher API Types**:
   - Raw pitcher data from API
   - Season stats vs career stats differences
   - Pitch mix data format

3. **Game Environment Types**:
   - Weather data format
   - Venue information
   - Game status data

### Domain Model Types

1. **Batter Domain Model**:
   - Normalized player data
   - Consistent numeric properties
   - Type guards and validators

2. **Pitcher Domain Model**:
   - Normalized pitcher stats
   - Performance metrics calculations
   - Validated properties

3. **Game Domain Model**:
   - Structured game data
   - Environmental factors
   - Schedule information

## Initial Implementation

We'll start with implementing the core API types for batters, pitchers, and game data based on the actual API responses captured.