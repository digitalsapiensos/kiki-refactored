# 🛠️ Development Setup Guide

## Prerequisites

### System Requirements
- **Node.js**: v18.17+ (recommend v20+)
- **npm**: v9+ or **yarn**: v1.22+
- **Git**: Latest stable version
- **VS Code**: Recommended IDE with extensions

### Required Accounts
- **Supabase**: For database and authentication
- **Vercel**: For deployment (optional for development)
- **AI Provider**: At least one (Claude, OpenAI, Gemini, DeepSeek, or Qwen)

## Quick Start

### 1. Clone and Install
```bash
# Clone the repository
git clone <repository-url>
cd kiki

# Install dependencies
npm install

# Install dev dependencies
npm install -D @types/node @types/react @types/react-dom
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit with your values
code .env.local
```

### 3. Database Setup
```bash
# Start local Supabase (optional)
npx supabase start

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### 4. Start Development
```bash
# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

## Detailed Setup Instructions

### Environment Variables Configuration

#### Required Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI Provider (choose at least one)
AI_PROVIDER=claude # claude, openai, gemini, deepseek, qwen

# Claude Configuration
CLAUDE_API_KEY=sk-ant-api03-...
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Gemini Configuration
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-1.5-flash

# DeepSeek Configuration
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_MODEL=deepseek-chat

# Qwen Configuration
QWEN_API_KEY=sk-...
QWEN_MODEL=qwen-max

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Kiki
JWT_SECRET=your-super-secret-jwt-key-here
```

#### Optional Variables
```bash
# SendGrid (for email notifications)
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
```

### Supabase Setup

#### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note your project URL and API keys
4. Add them to your `.env.local`

#### 2. Database Schema Setup
```bash
# Using Supabase CLI (recommended)
npx supabase db reset

# Or manually run SQL files
psql -h db.your-project.supabase.co -p 5432 -d postgres -U postgres -f supabase/migrations/01_initial_schema.sql
```

#### 3. Row Level Security Setup
The migrations automatically set up RLS policies. Verify with:
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename LIKE 'kiki_%';
```

### AI Provider Setup

#### Claude (Recommended)
1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Create API key
3. Add to environment: `CLAUDE_API_KEY=sk-ant-api03-...`

#### OpenAI
1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Create API key
3. Add to environment: `OPENAI_API_KEY=sk-...`

#### Other Providers
Similar setup for Gemini, DeepSeek, and Qwen with their respective platforms.

### MCP Server Setup

#### Installing MCP Servers
```bash
# Install Magic MCP (UI component generation)
npm install @mcp/magic-server

# Install Context7 MCP (documentation)
npm install @mcp/context7-server

# Install Sequential MCP (complex thinking)
npm install @mcp/sequential-server

# Install Playwright MCP (testing)
npm install @mcp/playwright-server
```

#### MCP Configuration
```typescript
// lib/mcp/config.ts
export const mcpConfig = {
  magic: {
    enabled: process.env.ENABLE_MAGIC_MCP === 'true',
    endpoint: process.env.MAGIC_MCP_ENDPOINT || 'http://localhost:3001'
  },
  context7: {
    enabled: process.env.ENABLE_CONTEXT7_MCP === 'true',
    endpoint: process.env.CONTEXT7_MCP_ENDPOINT || 'http://localhost:3002'
  },
  sequential: {
    enabled: process.env.ENABLE_SEQUENTIAL_MCP === 'true',
    endpoint: process.env.SEQUENTIAL_MCP_ENDPOINT || 'http://localhost:3003'
  },
  playwright: {
    enabled: process.env.ENABLE_PLAYWRIGHT_MCP === 'true',
    endpoint: process.env.PLAYWRIGHT_MCP_ENDPOINT || 'http://localhost:3004'
  }
}
```

## Development Tools

### VS Code Extensions
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml"
  ]
}
```

### Package Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test",
    "db:generate": "supabase gen types typescript --local > src/lib/database.types.ts",
    "db:reset": "supabase db reset",
    "db:migrate": "supabase db push",
    "db:seed": "node scripts/seed-database.js"
  }
}
```

### Git Hooks Setup
```bash
# Install husky for git hooks
npm install -D husky lint-staged

# Setup pre-commit hooks
npx husky add .husky/pre-commit "npx lint-staged"
```

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{md,json,yaml,yml}": [
      "prettier --write"
    ]
  }
}
```

## Database Management

### Local Development
```bash
# Start local Supabase
npx supabase start

# View local dashboard
open http://localhost:54323

# Reset database
npx supabase db reset

# Generate types
npm run db:generate
```

### Production Database
```bash
# Link to production project
npx supabase link --project-ref your-project-ref

# Pull production schema
npx supabase db pull

# Push local changes
npx supabase db push
```

### Migrations
```bash
# Create new migration
npx supabase migration new add-new-feature

# Edit migration file
code supabase/migrations/[timestamp]_add-new-feature.sql

# Apply migration
npx supabase db push
```

## Testing Setup

### Unit Tests (Jest + React Testing Library)
```bash
# Install testing dependencies
npm install -D jest @testing-library/react @testing-library/jest-dom

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

### E2E Tests (Playwright)
```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install

# Run E2E tests
npm run test:e2e

# Run tests in UI mode
npx playwright test --ui
```

### Test Configuration
```typescript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
```

## Common Development Tasks

### Adding New Wizard Phase
1. Create phase component: `src/components/wizard/phases/NewPhase.tsx`
2. Add to phase enum: `src/types/index.ts`
3. Update wizard navigation: `src/components/wizard/PhaseNavigation.tsx`
4. Add AI assistant prompt: `src/lib/ai/prompts/new-phase.ts`
5. Update database if needed: `supabase/migrations/`

### Creating New AI Assistant
1. Define assistant config: `src/lib/ai/assistants/new-assistant.ts`
2. Create system prompt: `src/lib/ai/prompts/new-assistant-prompt.ts`
3. Add to assistant registry: `src/lib/ai/registry.ts`
4. Test with chat interface

### Adding MCP Integration
1. Install MCP package: `npm install @mcp/new-server`
2. Configure in: `src/lib/mcp/config.ts`
3. Create client wrapper: `src/lib/mcp/clients/new-client.ts`
4. Use in components or API routes

## Troubleshooting

### Common Issues

#### Supabase Connection Issues
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test connection
npx supabase status
```

#### AI Provider API Issues
```bash
# Test Claude API
curl -X POST https://api.anthropic.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $CLAUDE_API_KEY" \
  -d '{"model":"claude-3-haiku-20240307","max_tokens":10,"messages":[{"role":"user","content":"Hello"}]}'
```

#### Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules
rm -rf node_modules package-lock.json
npm install

# Type check
npm run type-check
```

### Debugging Tools
- **React Developer Tools**: Browser extension
- **Supabase Dashboard**: Local at http://localhost:54323
- **Network Tab**: Monitor API requests
- **Console Logs**: Check for errors

## Deployment

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Environment Variables for Production
Ensure all required environment variables are set in your deployment platform with production values.

---

*This development setup guide provides all necessary information to get the Kiki platform running locally and ready for development. Last updated: January 2025*