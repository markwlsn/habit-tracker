# Configuration Service Documentation

## Overview

The Configuration Service provides centralized environment variable management and Supabase client factory functionality for the Habit Tracker backend application.

## Features

- ✅ **Environment Variable Loading** - Automatically loads from .env files
- ✅ **Required Variable Validation** - Validates all required environment variables at startup
- ✅ **Supabase Client Factory** - Creates and manages Supabase client instances
- ✅ **Singleton Pattern** - Ensures consistent configuration across the application
- ✅ **Type Safety** - Full TypeScript support with proper interfaces
- ✅ **Error Handling** - Graceful handling of missing configuration with clear error messages

## Requirements Satisfied

| Requirement | Description | Implementation |
|-------------|-------------|----------------|
| 12.1 | Read Supabase URL from environment variables | ✅ ConfigService.load() |
| 12.2 | Read Supabase API key from environment variables | ✅ ConfigService.load() |
| 12.3 | Read server port with default of 3000 | ✅ ConfigService.load() |
| 12.4 | Read Node environment with default of development | ✅ ConfigService.load() |
| 12.5 | Exit with error when required variables are missing | ✅ ConfigService.load() |

## Usage

### Basic Configuration Loading

```typescript
import ConfigService from '../config';

// Load configuration (call once at application startup)
const config = ConfigService.load();

// Access configuration values
console.log(config.supabase.url);
console.log(config.server.port);
console.log(config.server.nodeEnv);
```

### Accessing Configuration Later

```typescript
import ConfigService from '../config';

// Get previously loaded configuration
const config = ConfigService.get();
```

### Using Supabase Clients

```typescript
import { supabaseAdmin, supabasePublic, SupabaseClientFactory } from '../config';

// Using singleton functions (recommended)
const adminClient = supabaseAdmin();
const publicClient = supabasePublic();

// Using factory methods directly
const adminClient = SupabaseClientFactory.getAdminClient();
const publicClient = SupabaseClientFactory.getPublicClient();
```

## Environment Variables

### Required Variables

The following environment variables must be set for the application to start:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous/public key
- `SUPABASE_SERVICE_KEY` - Supabase service/secret key
- `JWT_SECRET` - Secret key for JWT token validation

### Optional Variables

These variables have default values if not provided:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Node environment (default: 'development')

### Example .env File

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here

# JWT Configuration
JWT_SECRET=your-jwt-secret-here

# Server Configuration (optional)
PORT=3000
NODE_ENV=development
```

## Supabase Client Types

### Admin Client

- Uses the service key for server-side operations
- Bypasses Row Level Security (RLS) policies
- Used for administrative operations and setup tasks
- Configured with `autoRefreshToken: false` and `persistSession: false`

```typescript
const adminClient = supabaseAdmin();
// Use for setup, migrations, admin operations
```

### Public Client

- Uses the anonymous key for user-authenticated operations
- Respects Row Level Security (RLS) policies
- Used for normal application operations with user context
- Standard client configuration

```typescript
const publicClient = supabasePublic();
// Use for user operations, repository layer
```

## Error Handling

### Missing Environment Variables

When required environment variables are missing, the application will:

1. Log an error message listing all missing variables
2. Exit with code 1 
3. Display help text directing to environment setup

Example error output:
```
ERROR: Missing required environment variables: SUPABASE_URL, JWT_SECRET
Please set these variables in your .env file or environment.
```

### Configuration Not Loaded

If you try to access configuration before loading:

```typescript
ConfigService.get(); // Throws: Configuration not loaded. Call ConfigService.load() first.
```

## Testing

### Unit Tests

The configuration service includes comprehensive unit tests covering:

- Environment variable validation
- Default value handling
- Error handling for missing variables
- Singleton pattern behavior
- Supabase client factory functionality

### Test Configuration

For testing, use a separate `.env.test` file:

```bash
SUPABASE_URL=https://test-project.supabase.co
SUPABASE_ANON_KEY=test-anon-key-for-testing
SUPABASE_SERVICE_KEY=test-service-key-for-testing
JWT_SECRET=test-jwt-secret-for-testing-only
PORT=3001
NODE_ENV=test
```

### Resetting in Tests

```typescript
import ConfigService, { SupabaseClientFactory } from '../config';

beforeEach(() => {
  ConfigService.reset();
  SupabaseClientFactory.reset();
});
```

## Implementation Details

### Singleton Pattern

Both ConfigService and SupabaseClientFactory use the singleton pattern to ensure:

- Configuration is loaded only once
- Supabase clients are reused across the application
- Consistent configuration throughout the app lifecycle

### Type Safety

The configuration is fully typed with the `Config` interface:

```typescript
interface Config {
  supabase: {
    url: string;
    anonKey: string;
    serviceKey: string;
  };
  server: {
    port: number;
    nodeEnv: string;
  };
  jwt: {
    secret: string;
  };
}
```

### Lazy Loading

Supabase clients are created lazily - only when first accessed. This ensures:

- No unnecessary client creation
- Configuration is loaded before client creation
- Better startup performance

## Best Practices

1. **Load Early**: Call `ConfigService.load()` at application startup
2. **Use Singletons**: Use exported functions `supabaseAdmin()` and `supabasePublic()`
3. **Environment Separation**: Use different `.env` files for different environments
4. **Secure Secrets**: Never commit actual credentials to version control
5. **Reset in Tests**: Always reset configuration state between tests

## Verification

To verify the configuration service is working correctly, run:

```bash
npm run verify-config
```

This script will:
- Load configuration
- Test environment variable validation
- Create Supabase client instances
- Verify singleton behavior
- Confirm all requirements are met