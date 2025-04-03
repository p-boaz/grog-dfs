# MLB DFS Development Workflow Guide

This guide outlines the recommended development workflow for working on the MLB DFS application. It covers setup, development, testing, and deployment processes.

## Environment Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm 8+ (required for package management)
- TypeScript 5.0+
- Git

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/grog-dfs.git
   cd grog-dfs
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```
   
   > ⚠️ **Important**: Always use `pnpm` for package management, never `npm` or `yarn`.

3. **Setup environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your settings
   ```

4. **Setup the database**:
   ```bash
   pnpm run db:setup
   pnpm run db:seed
   ```

### Development Environment

1. **Start the development server**:
   ```bash
   pnpm run dev
   ```

2. **Access the application**:
   Open your browser to `http://localhost:3000`

## Development Workflow

### 1. Feature Planning

Before starting development:

1. **Document requirements and acceptance criteria**
2. **Break down the work into discrete tasks**
3. **Identify affected modules and dependencies**
4. **Plan testing strategy for the new feature**

### 2. Branching Strategy

Create a feature branch for your work:

```bash
# Create a branch from main
git checkout main
git pull
git checkout -b feature/add-player-comparison

# Work on your changes
# ...

# Regularly commit your changes
git add .
git commit -m "Add player comparison component"

# Push to remote
git push -u origin feature/add-player-comparison
```

### 3. Code Development

#### TypeScript Standards

- Use strict type checking
- Avoid any `@ts-ignore` comments
- Use proper imports from the three-layer type system
- Add JSDoc comments for all public functions

#### Code Style Guidelines

- 2-space indentation
- Semicolons required
- 100-character line length
- Group imports (React, third-party, internal)
- Use optional chaining and nullish coalescing
- Prefer early returns
- Use async/await over Promise chains

#### Component Development

- Use functional components with hooks
- Keep components small and focused
- Separate UI from business logic
- Use proper React.memo for optimization
- Follow shadcn/ui patterns for UI components

### 4. Testing

#### Running Tests

```bash
# Lint your code
pnpm lint

# Type check your code
pnpm tsc --noEmit

# Run specific module tests
pnpm tsx scripts/tests/test-aggregate-scoring.ts
```

#### Test Scripts

Create test scripts for business logic modules:

1. Create a test script in `scripts/tests/`
2. Import the module to test
3. Create test cases covering critical paths
4. Include error handling tests
5. Add validation for return types
6. Log results to console and test log file

Example test script:
```typescript
import * as fs from 'fs';
import * as path from 'path';
import { calculateDfsPoints } from '../../lib/mlb/dfs-analysis/shared/aggregate-scoring';

const LOG_FILE = path.join(__dirname, '../../logs/aggregate-scoring-test.log');

// Initialize log file
fs.writeFileSync(LOG_FILE, `Test run: ${new Date().toISOString()}\n\n`);

function log(message: string) {
  console.log(message);
  fs.appendFileSync(LOG_FILE, message + '\n');
}

async function testFunction() {
  try {
    const result = await calculateDfsPoints({ 
      playerId: 545361, 
      gameId: '717465'
    });
    
    log('Test successful: ' + JSON.stringify(result, null, 2));
    return true;
  } catch (error) {
    log('Test failed: ' + error.message);
    return false;
  }
}

testFunction().then(success => {
  console.log(`Test ${success ? 'PASSED' : 'FAILED'}`);
});
```

### 5. Code Review and Pull Requests

1. **Create a pull request**:
   - Add a descriptive title
   - Provide a summary of changes
   - Reference related issues
   - Include testing instructions

2. **Review criteria**:
   - Code passes linting and type checks
   - Tests are included or updated
   - Documentation is updated
   - Follows project conventions
   - No unnecessary changes

3. **Address feedback**:
   - Make requested changes
   - Push updates to your branch
   - Request re-review as needed

### 6. Merge and Deploy

1. **Merge to main**:
   - Squash-merge small PRs
   - Preserve commits for larger PRs
   - Ensure CI checks pass before merging

2. **Deployment**:
   - Staging deployment is automatic from main
   - Production deployment requires manual approval
   - Monitor deployment for any issues

## Database Management

### Schema Changes

Always follow this workflow for schema changes:

1. **Update schema.ts**:
   ```typescript
   // Add new fields or tables in lib/db/schema.ts
   // Example:
   export const users = pgTable('users', {
     id: serial('id').primaryKey(),
     name: text('name').notNull(),
     email: text('email').notNull().unique(),
     // New field
     preferredTeam: text('preferred_team'),
   });
   ```

2. **Generate migration**:
   ```bash
   pnpm run db:generate
   ```

3. **Apply migration**:
   ```bash
   pnpm run db:migrate
   ```

4. **Update seeds if needed**:
   ```bash
   # Edit lib/db/seed.ts to add seed data for new fields
   pnpm run db:seed
   ```

### Working with Data

Use the Drizzle ORM for database operations:

```typescript
import { db } from '@/lib/db/drizzle';
import { users, teams } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Query example
async function getUserTeam(userId: number) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      team: true,
    },
  });
  return user?.team;
}
```

## MLB API Integration

### Adding New API Features

When adding new API integration:

1. **Define API types**:
   ```typescript
   // Add to lib/mlb/types/api/player.ts
   export interface PlayerAchievementsApiResponse {
     awards: Array<{
       name: string;
       season: string;
     }>;
   }
   ```

2. **Create domain model**:
   ```typescript
   // Add to lib/mlb/types/domain/player.ts
   export interface PlayerAchievement {
     name: string;
     season: number;
     date: string;
   }
   ```

3. **Implement API client function**:
   ```typescript
   // In appropriate module file
   import { makeMLBApiRequest } from '../core/api-client';
   import { withCache, DEFAULT_CACHE_TTL } from '../cache';
   import { Api } from '../types';

   async function fetchPlayerAchievements(params: { 
     playerId: number 
   }): Promise<Api.PlayerAchievementsApiResponse> {
     return makeMLBApiRequest(
       `/people/${params.playerId}/achievements`,
       'V1'
     );
   }

   export const getPlayerAchievements = withCache(
     fetchPlayerAchievements,
     'player-achievements',
     DEFAULT_CACHE_TTL.player
   );
   ```

4. **Add conversion function**:
   ```typescript
   // Convert API model to domain model
   function convertAchievements(
     apiResponse: Api.PlayerAchievementsApiResponse
   ): PlayerAchievement[] {
     return apiResponse.awards.map(award => ({
       name: award.name,
       season: parseInt(award.season, 10),
       date: new Date().toISOString(), // Default or API value
     }));
   }
   ```

### Capturing API Responses

For new API endpoints, capture example responses:

```bash
# Capture API response samples
pnpm tsx scripts/capture-api-samples.ts

# Generate types from response examples
pnpm tsx scripts/generate-api-types.ts
```

## DFS Analysis Modules

### Adding a New Analysis Module

1. **Define analysis types**:
   ```typescript
   // Add to lib/mlb/types/analysis/batter.ts
   export interface ContactQualityAnalysis {
     hardHitRate: number;
     barrelRate: number;
     expectedBattingAverage: number;
     factors: {
       batterProfile: number;
       recentForm: number;
     };
   }
   ```

2. **Create module file**:
   ```typescript
   // lib/mlb/dfs-analysis/batters/contact-quality.ts
   import { Domain, Analysis } from '../../types';
   
   export async function analyzeContactQuality(
     batter: Domain.Batter,
     game: Domain.Game
   ): Promise<Analysis.ContactQualityAnalysis> {
     // Implementation logic...
   }
   ```

3. **Add to main analysis pipeline**:
   ```typescript
   // Update in batter-analysis.ts
   import { analyzeContactQuality } from './contact-quality';
   
   async function analyzeBatter(batterId: number, gameId: string) {
     // Existing code...
     
     // Add new analysis component
     const contactQuality = await analyzeContactQuality(batter, game);
     
     return {
       // Include new analysis in results
       contactQuality,
       // Other properties...
     };
   }
   ```

4. **Create test script**:
   ```typescript
   // scripts/tests/test-contact-quality.ts
   import { analyzeContactQuality } from '../../lib/mlb/dfs-analysis/batters/contact-quality';
   
   // Test implementation...
   ```

## Common Commands

### Development

```bash
# Start development server
pnpm run dev

# Lint code
pnpm lint

# Type check
pnpm tsc --noEmit

# Run single TypeScript file
pnpm tsx <file-path>
```

### Database

```bash
# Setup database
pnpm run db:setup

# Generate migration from schema changes
pnpm run db:generate

# Apply migrations
pnpm run db:migrate

# Seed database with test data
pnpm run db:seed

# Open database UI
pnpm run db:studio
```

### Build and Deployment

```bash
# Build for production
pnpm run build

# Start production server
pnpm start

# Analyze bundle
pnpm run analyze
```

## Troubleshooting

### Common Issues

#### TypeScript Errors

**Issue**: Errors about missing properties on types

**Solution**:
- Check that you're using the correct layer (Api, Domain, Analysis)
- Update imports to use the proper type source
- Avoid @ts-ignore; fix the underlying type issue

#### API Integration Issues

**Issue**: API responses don't match expected structure

**Solution**:
- Capture actual API response with scripts/capture-api-samples.ts
- Compare with type definition
- Update type or add proper conversion

#### Database Errors

**Issue**: Migration fails because of constraint violations

**Solution**:
- Check existing data before adding NOT NULL constraints
- Add default values for new required fields
- Use separate migrations for schema changes and data updates

## Additional Resources

- [Type System Guide](/knowledge/guides/type-system-guide.md): Guide to the type system
- [API Guide](/knowledge/guides/api-guide.md): MLB API integration details
- [Type System Architecture](/knowledge/reference/type-system/architecture.md): Type system reference