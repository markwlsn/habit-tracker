# Design Document: Habit Tracker Backend

## Overview

The Habit Tracker Backend is a TypeScript-based REST API built on Express.js and Supabase (PostgreSQL + Auth). It provides secure habit tracking functionality with automated streak calculation, analytics, and a comprehensive dashboard endpoint. The system implements a three-layer architecture (Controller → Service → Repository) for clean separation of concerns and maintainability.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Client App    │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────────────────────┐
│     Express.js Server           │
│  ┌───────────────────────────┐  │
│  │   Controller Layer        │  │ ← HTTP handling, validation
│  └───────────┬───────────────┘  │
│              │                   │
│  ┌───────────▼───────────────┐  │
│  │   Service Layer           │  │ ← Business logic
│  └───────────┬───────────────┘  │
│              │                   │
│  ┌───────────▼───────────────┐  │
│  │   Repository Layer        │  │ ← Data access
│  └───────────┬───────────────┘  │
└──────────────┼───────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│       Supabase Platform         │
│  ┌──────────────────────────┐   │
│  │   PostgreSQL Database    │   │
│  │   + Row Level Security   │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │   Supabase Auth          │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

### Technology Stack

- **Runtime**: Node.js LTS
- **Language**: TypeScript
- **Web Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (JWT)
- **Validation**: Zod
- **Testing**: Jest + Supertest
- **Package Manager**: npm

## Component Design

### 1. Controller Layer

**Responsibility**: Handle HTTP requests, validate input, format responses

**Components**:

#### AuthController
```typescript
class AuthController {
  async register(req: Request, res: Response): Promise<void>
  async login(req: Request, res: Response): Promise<void>
  async logout(req: Request, res: Response): Promise<void>
}
```

**Behavior**:
- Extracts credentials from request body
- Calls AuthService methods
- Returns JWT tokens on successful authentication
- Formats error responses with appropriate status codes

#### HabitController
```typescript
class HabitController {
  async create(req: Request, res: Response): Promise<void>
  async getAll(req: Request, res: Response): Promise<void>
  async getById(req: Request, res: Response): Promise<void>
  async update(req: Request, res: Response): Promise<void>
  async delete(req: Request, res: Response): Promise<void>
}
```

**Behavior**:
- Validates habit data using Zod schemas
- Extracts user ID from JWT token
- Calls HabitService methods
- Returns habit data in standardized format

#### LogController
```typescript
class LogController {
  async create(req: Request, res: Response): Promise<void>
  async getByHabit(req: Request, res: Response): Promise<void>
  async delete(req: Request, res: Response): Promise<void>
}
```

**Behavior**:
- Validates log data and date ranges
- Prevents duplicate log creation
- Returns filtered log data

#### AnalyticsController
```typescript
class AnalyticsController {
  async getDashboard(req: Request, res: Response): Promise<void>
}
```

**Behavior**:
- Accepts optional date range filters
- Aggregates data from multiple services
- Returns comprehensive dashboard payload

### 2. Service Layer

**Responsibility**: Implement business logic, coordinate operations

**Components**:

#### AuthService
```typescript
class AuthService {
  async register(email: string, password: string): Promise<{ user: User; token: string }>
  async login(email: string, password: string): Promise<{ user: User; token: string }>
  async logout(token: string): Promise<void>
  async validateToken(token: string): Promise<User | null>
}
```

**Behavior**:
- Delegates to Supabase Auth client
- Validates JWT tokens for protected endpoints
- Returns user data and access tokens

#### HabitService
```typescript
class HabitService {
  async createHabit(userId: string, data: CreateHabitDTO): Promise<Habit>
  async getUserHabits(userId: string): Promise<Habit[]>
  async getHabitById(habitId: string, userId: string): Promise<Habit | null>
  async updateHabit(habitId: string, userId: string, data: UpdateHabitDTO): Promise<Habit>
  async deleteHabit(habitId: string, userId: string): Promise<void>
}
```

**Behavior**:
- Validates user ownership before modifications
- Sets default values for optional fields
- Coordinates with repository layer

#### LogService
```typescript
class LogService {
  async createLog(userId: string, habitId: string, date: Date): Promise<HabitLog>
  async getLogsByHabit(habitId: string, userId: string, dateRange?: DateRange): Promise<HabitLog[]>
  async deleteLog(logId: string, userId: string): Promise<void>
  async checkDuplicateLog(habitId: string, date: Date): Promise<boolean>
}
```

**Behavior**:
- Checks for duplicate logs before creation
- Filters logs by date range
- Validates user ownership

#### StreakService
```typescript
class StreakService {
  async calculateDailyStreak(habitId: string, referenceDate: Date): Promise<StreakData>
  async calculateWeeklyStreak(habitId: string, targetCount: number, referenceDate: Date): Promise<StreakData>
  async getStreakForHabit(habit: Habit, referenceDate: Date): Promise<StreakData>
}
```

**Behavior**:
- Fetches completion logs from repository
- Implements streak calculation algorithms
- Returns current streak and longest streak
- Handles daily and weekly frequencies differently
- No grace periods for missed completions

**Streak Calculation Algorithm (Daily)**:
```
1. Start from reference date (today)
2. Check if there's a completion for current day
3. If no: return streak = 0
4. If yes: move back one day and repeat
5. Count consecutive days with completions
6. Also track longest historical streak
```

**Streak Calculation Algorithm (Weekly)**:
```
1. Start from reference date's week
2. Count completions in current week
3. If count < target: return streak = 0
4. If count >= target: move back one week and repeat
5. Count consecutive weeks meeting target
6. Also track longest historical streak
```

#### AnalyticsService
```typescript
class AnalyticsService {
  async getDashboardData(userId: string, dateRange?: DateRange): Promise<DashboardData>
  async generateHeatmapData(userId: string, dateRange?: DateRange): Promise<HeatmapEntry[]>
  async calculateStatistics(userId: string, dateRange?: DateRange): Promise<Statistics>
  async calculateCompletionRate(habit: Habit, logs: HabitLog[], dateRange: DateRange): Promise<number>
}
```

**Behavior**:
- Aggregates data across all user habits
- Generates heatmap showing completion frequency
- Calculates total habits, active streaks, completion rates
- Completion rate = (actual completions / expected completions) * 100
- Expected completions based on habit frequency and date range

### 3. Repository Layer

**Responsibility**: Execute database queries, handle data persistence

**Components**:

#### HabitRepository
```typescript
class HabitRepository {
  async create(habit: HabitEntity): Promise<HabitEntity>
  async findByUserId(userId: string): Promise<HabitEntity[]>
  async findById(id: string): Promise<HabitEntity | null>
  async update(id: string, data: Partial<HabitEntity>): Promise<HabitEntity>
  async delete(id: string): Promise<void>
}
```

**Behavior**:
- Uses Supabase client for queries
- Relies on RLS policies for access control
- Returns typed entities

#### LogRepository
```typescript
class LogRepository {
  async create(log: LogEntity): Promise<LogEntity>
  async findByHabitId(habitId: string, dateRange?: DateRange): Promise<LogEntity[]>
  async findByHabitAndDate(habitId: string, date: Date): Promise<LogEntity | null>
  async delete(id: string): Promise<void>
  async deleteByHabitId(habitId: string): Promise<void>
}
```

**Behavior**:
- Supports date range filtering
- Implements duplicate detection queries
- Cascades deletes when habits are removed

### 4. Middleware

#### authMiddleware
```typescript
async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void>
```

**Behavior**:
- Extracts JWT token from Authorization header
- Validates token using AuthService
- Attaches user object to request
- Returns 401 if token is invalid or missing

#### errorMiddleware
```typescript
function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction): void
```

**Behavior**:
- Catches all thrown errors
- Logs errors with stack traces
- Returns standardized error responses
- Sanitizes sensitive information
- Maps error types to HTTP status codes

#### validationMiddleware
```typescript
function validationMiddleware(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void
}
```

**Behavior**:
- Validates request body against Zod schema
- Returns 400 with validation errors if invalid
- Passes validated data to controller if valid

## Data Models

### Database Schema

#### users table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```
**Note**: User authentication is handled by Supabase Auth; this table stores additional user data if needed.

#### habits table
```sql
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly')),
  target_count INTEGER CHECK (target_count IS NULL OR target_count > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_habits_user_id ON habits(user_id);
```

#### habit_logs table
```sql
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(habit_id, completion_date)
);

CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX idx_habit_logs_completion_date ON habit_logs(completion_date);
```

### Row Level Security Policies

#### habits table RLS
```sql
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);
```

#### habit_logs table RLS
```sql
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own logs"
  ON habit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own logs"
  ON habit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs"
  ON habit_logs FOR DELETE
  USING (auth.uid() = user_id);
```

### TypeScript Interfaces

#### Domain Models
```typescript
interface Habit {
  id: string;
  userId: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly';
  targetCount: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  completionDate: Date;
  createdAt: Date;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
}

interface User {
  id: string;
  email: string;
}
```

#### DTOs
```typescript
interface CreateHabitDTO {
  name: string;
  description: string;
  frequency: 'daily' | 'weekly';
  targetCount?: number;
}

interface UpdateHabitDTO {
  name?: string;
  description?: string;
  frequency?: 'daily' | 'weekly';
  targetCount?: number;
}

interface CreateLogDTO {
  habitId: string;
  completionDate?: Date; // Defaults to current date
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface HeatmapEntry {
  date: string; // ISO format
  count: number;
}

interface Statistics {
  totalHabits: number;
  activeStreaks: number;
  averageCompletionRate: number;
}

interface DashboardData {
  heatmap: HeatmapEntry[];
  statistics: Statistics;
  habits: Array<Habit & { streak: StreakData }>;
}
```

#### API Response Formats
```typescript
interface SuccessResponse<T> {
  data: T;
}

interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
```typescript
Request Body:
{
  email: string;
  password: string;
}

Success Response (201):
{
  data: {
    user: { id: string; email: string; },
    token: string;
  }
}

Error Response (400): Validation error
Error Response (409): Email already exists
```

#### POST /api/auth/login
```typescript
Request Body:
{
  email: string;
  password: string;
}

Success Response (200):
{
  data: {
    user: { id: string; email: string; },
    token: string;
  }
}

Error Response (401): Invalid credentials
```

#### POST /api/auth/logout
```typescript
Headers:
  Authorization: Bearer <token>

Success Response (200):
{
  data: { message: "Logged out successfully" }
}
```

### Habit Management Endpoints

#### POST /api/habits
```typescript
Headers:
  Authorization: Bearer <token>

Request Body:
{
  name: string;
  description: string;
  frequency: "daily" | "weekly";
  targetCount?: number; // Required if frequency is "weekly"
}

Success Response (201):
{
  data: Habit
}

Error Response (400): Validation error
Error Response (401): Unauthorized
```

#### GET /api/habits
```typescript
Headers:
  Authorization: Bearer <token>

Success Response (200):
{
  data: Habit[]
}

Error Response (401): Unauthorized
```

#### GET /api/habits/:id
```typescript
Headers:
  Authorization: Bearer <token>

Success Response (200):
{
  data: Habit
}

Error Response (401): Unauthorized
Error Response (404): Habit not found
```

#### PUT /api/habits/:id
```typescript
Headers:
  Authorization: Bearer <token>

Request Body:
{
  name?: string;
  description?: string;
  frequency?: "daily" | "weekly";
  targetCount?: number;
}

Success Response (200):
{
  data: Habit
}

Error Response (400): Validation error
Error Response (401): Unauthorized
Error Response (404): Habit not found
```

#### DELETE /api/habits/:id
```typescript
Headers:
  Authorization: Bearer <token>

Success Response (200):
{
  data: { message: "Habit deleted successfully" }
}

Error Response (401): Unauthorized
Error Response (404): Habit not found
```

### Habit Logging Endpoints

#### POST /api/logs
```typescript
Headers:
  Authorization: Bearer <token>

Request Body:
{
  habitId: string;
  completionDate?: string; // ISO date format, defaults to today
}

Success Response (201):
{
  data: HabitLog
}

Error Response (400): Validation error or duplicate log
Error Response (401): Unauthorized
Error Response (404): Habit not found
```

#### GET /api/logs/:habitId
```typescript
Headers:
  Authorization: Bearer <token>

Query Parameters:
  startDate?: string; // ISO date format
  endDate?: string; // ISO date format

Success Response (200):
{
  data: HabitLog[]
}

Error Response (401): Unauthorized
Error Response (404): Habit not found
```

#### DELETE /api/logs/:id
```typescript
Headers:
  Authorization: Bearer <token>

Success Response (200):
{
  data: { message: "Log deleted successfully" }
}

Error Response (401): Unauthorized
Error Response (404): Log not found
```

### Analytics Endpoints

#### GET /api/analytics/dashboard
```typescript
Headers:
  Authorization: Bearer <token>

Query Parameters:
  startDate?: string; // ISO date format
  endDate?: string; // ISO date format

Success Response (200):
{
  data: {
    heatmap: Array<{ date: string; count: number; }>;
    statistics: {
      totalHabits: number;
      activeStreaks: number;
      averageCompletionRate: number;
    };
    habits: Array<Habit & { streak: StreakData; }>;
  }
}

Error Response (401): Unauthorized
```

#### GET /api/habits/:id/streak
```typescript
Headers:
  Authorization: Bearer <token>

Success Response (200):
{
  data: {
    currentStreak: number;
    longestStreak: number;
  }
}

Error Response (401): Unauthorized
Error Response (404): Habit not found
```

## Validation Schemas

### Zod Schemas

```typescript
// Authentication
const RegisterSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});

// Habits
const CreateHabitSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().min(1, "Description is required").max(500, "Description too long"),
  frequency: z.enum(["daily", "weekly"], { required_error: "Frequency must be 'daily' or 'weekly'" }),
  targetCount: z.number().int().positive("Target count must be positive").optional()
}).refine(
  (data) => data.frequency !== "weekly" || data.targetCount !== undefined,
  { message: "Target count is required for weekly habits", path: ["targetCount"] }
);

const UpdateHabitSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  frequency: z.enum(["daily", "weekly"]).optional(),
  targetCount: z.number().int().positive().optional()
});

// Logs
const CreateLogSchema = z.object({
  habitId: z.string().uuid("Invalid habit ID"),
  completionDate: z.string().datetime().optional()
});

const DateRangeSchema = z.object({
  startDate: z.string().datetime("Invalid start date format"),
  endDate: z.string().datetime("Invalid end date format")
}).optional();
```

## Error Handling

### Error Types

```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
  }
}

class ValidationError extends AppError {
  constructor(details: unknown) {
    super(400, "Validation failed", "VALIDATION_ERROR", details);
  }
}

class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(401, message, "AUTH_ERROR");
  }
}

class AuthorizationError extends AppError {
  constructor(message: string = "Access denied") {
    super(403, message, "FORBIDDEN");
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, "NOT_FOUND");
  }
}

class DuplicateError extends AppError {
  constructor(message: string) {
    super(409, message, "DUPLICATE");
  }
}

class DatabaseError extends AppError {
  constructor() {
    super(500, "An internal error occurred", "DATABASE_ERROR");
  }
}
```

### Error Handling Flow

1. **Validation Errors**: Caught by validation middleware, return 400 with Zod error details
2. **Business Logic Errors**: Thrown by service layer as typed errors
3. **Database Errors**: Caught by repository layer, wrapped as DatabaseError
4. **Unhandled Errors**: Caught by error middleware, logged, and returned as 500
5. **Sensitive Data**: All error responses sanitized to remove stack traces, database details

## Configuration

### Environment Variables

```typescript
interface Config {
  supabase: {
    url: string;           // SUPABASE_URL
    anonKey: string;       // SUPABASE_ANON_KEY
    serviceKey: string;    // SUPABASE_SERVICE_KEY
  };
  server: {
    port: number;          // PORT (default: 3000)
    nodeEnv: string;       // NODE_ENV (default: 'development')
  };
  jwt: {
    secret: string;        // JWT_SECRET
  };
}
```

### Configuration Loading

```typescript
class ConfigService {
  private static instance: Config;

  static load(): Config {
    const required = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_KEY',
      'JWT_SECRET'
    ];

    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }

    return {
      supabase: {
        url: process.env.SUPABASE_URL!,
        anonKey: process.env.SUPABASE_ANON_KEY!,
        serviceKey: process.env.SUPABASE_SERVICE_KEY!
      },
      server: {
        port: parseInt(process.env.PORT || '3000'),
        nodeEnv: process.env.NODE_ENV || 'development'
      },
      jwt: {
        secret: process.env.JWT_SECRET!
      }
    };
  }
}
```

## Setup Script

### setup.ts

```typescript
async function setupDatabase() {
  // 1. Validate environment variables
  validateEnvVars(['SUPABASE_URL', 'SUPABASE_SERVICE_KEY']);

  // 2. Initialize Supabase client
  const supabase = createClient(url, serviceKey);

  // 3. Test connectivity
  await testConnection(supabase);

  // 4. Create tables
  await createHabitsTable(supabase);
  await createHabitLogsTable(supabase);

  // 5. Create RLS policies
  await createHabitsRLS(supabase);
  await createHabitLogsRLS(supabase);

  // 6. Create indexes
  await createIndexes(supabase);

  // 7. Verify setup
  await verifySetup(supabase);

  console.log('✓ Database setup completed successfully');
}
```

**Usage**:
```bash
npm run setup
```

**Features**:
- Validates required environment variables
- Tests database connectivity before proceeding
- Creates all tables with proper constraints
- Applies Row Level Security policies
- Creates performance indexes
- Verifies setup by querying system tables
- Exits with error code if any step fails
- Idempotent (safe to run multiple times)

## Testing Strategy

### Unit Tests (Jest)

**Service Layer Tests**:
```typescript
describe('StreakService', () => {
  it('calculates daily streak correctly for consecutive days', async () => {
    // Test with mock data
  });

  it('resets daily streak when a day is missed', async () => {
    // Test with gap in completions
  });

  it('calculates weekly streak based on target count', async () => {
    // Test with various target counts
  });
});
```

**Focus Areas**:
- Streak calculation algorithms with various patterns
- Validation logic edge cases
- Business rule enforcement
- Error handling paths

**Mocking Strategy**:
- Mock repository layer for service tests
- Mock Supabase client for repository tests
- Use Jest mocks for external dependencies

### Integration Tests (Supertest)

**API Endpoint Tests**:
```typescript
describe('POST /api/habits', () => {
  it('creates a daily habit successfully', async () => {
    const response = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Exercise', description: 'Daily workout', frequency: 'daily' });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('id');
  });

  it('rejects habit creation without required fields', async () => {
    const response = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Exercise' });

    expect(response.status).toBe(400);
  });
});
```

**Focus Areas**:
- Full request/response cycle
- Authentication and authorization
- Database persistence
- RLS policy enforcement
- Error response formatting

**Test Database**:
- Use separate Supabase project for tests
- Reset database state between tests
- Seed test data as needed

### Property-Based Tests

**Test Configuration**:
- Minimum 100 iterations per property test
- Use fast-check library for TypeScript
- Tag format: `Feature: habit-tracker-backend, Property {number}: {property_text}`

**Generator Strategy**:
- Generate random users, habits, logs
- Include edge cases (empty lists, boundary dates)
- Test across various habit frequencies and target counts

## Deployment Considerations

### Production Checklist

1. **Environment Variables**: Set all required vars in production environment
2. **Database Setup**: Run setup script against production Supabase project
3. **RLS Verification**: Confirm RLS policies are active
4. **SSL/TLS**: Ensure HTTPS for API endpoints
5. **Rate Limiting**: Implement rate limiting middleware
6. **CORS Configuration**: Configure allowed origins
7. **Logging**: Set up structured logging (Winston or Pino)
8. **Monitoring**: Configure error tracking (Sentry or similar)
9. **Health Checks**: Implement /health endpoint
10. **CI/CD**: Automate tests and deployment

### Performance Optimization

- **Database Indexes**: Already included in setup script
- **Query Optimization**: Use Supabase query filtering to minimize data transfer
- **Caching**: Consider Redis for frequently accessed analytics data
- **Connection Pooling**: Configure Supabase connection pool size
- **Pagination**: Add pagination to list endpoints for large datasets

## Security Considerations

### Authentication Security
- JWT tokens expire after configurable period
- Passwords hashed by Supabase Auth (bcrypt)
- Tokens validated on every protected request
- Session invalidation on logout

### Authorization Security
- RLS policies enforce user data isolation at database level
- All queries inherit user context from JWT
- No user can access another user's data
- Service layer validates ownership for all operations

### Input Validation Security
- All inputs validated with Zod before processing
- SQL injection prevented by parameterized queries (Supabase client)
- XSS prevention through proper response encoding
- CSRF protection via JWT bearer tokens

### Data Security
- Sensitive data not logged in error messages
- Stack traces only exposed in development
- Database credentials stored in environment variables
- No hard-coded secrets in codebase

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: JWT Token Validation Consistency

*For any* JWT token state (valid, invalid, expired, malformed, missing), the authentication middleware SHALL make the correct authorization decision (allow or deny), and SHALL return a 401 status code for all invalid states.

**Validates: Requirements 1.5**

### Property 2: Row Level Security Isolation

*For any* pair of distinct users and any data operation (read, write, update, delete), the database SHALL prevent each user from accessing the other user's habits and logs, ensuring complete data isolation.

**Validates: Requirements 1.6**

### Property 3: Habit Validation Rejection

*For any* habit creation request with missing required fields (name, description, or frequency) or invalid data types, the validation middleware SHALL reject the request with a 400 status code and SHALL include detailed error information.

**Validates: Requirements 2.1, 2.4, 7.2, 7.3, 7.4**

### Property 4: User Habit Retrieval Correctness

*For any* user with any set of habits, retrieving the user's habits SHALL return exactly the habits owned by that user and SHALL NOT include habits owned by other users.

**Validates: Requirements 2.5**

### Property 5: Selective Habit Update

*For any* habit and any subset of updateable fields (name, description, frequency, targetCount), updating the habit SHALL modify only the specified fields and SHALL leave all other fields unchanged.

**Validates: Requirements 2.6**

### Property 6: Cascading Habit Deletion

*For any* habit with any number of associated habit logs, deleting the habit SHALL remove both the habit record and all associated log records from the database.

**Validates: Requirements 2.7**

### Property 7: Data Persistence Completeness

*For any* habit or log creation request, the stored database record SHALL contain all required fields (user_id, timestamps, and entity-specific fields) with correct values.

**Validates: Requirements 2.8, 3.7**

### Property 8: Duplicate Log Prevention

*For any* habit and any date, attempting to create multiple log entries for the same habit and date SHALL result in the second attempt being rejected, preserving only the original log entry.

**Validates: Requirements 3.4**

### Property 9: Log Filtering Correctness

*For any* habit with any set of logs and any date range filter, the returned logs SHALL include only logs within the specified date range and SHALL include all logs within that range.

**Validates: Requirements 3.5**

### Property 10: Daily Streak Calculation Correctness

*For any* daily habit with any completion history and any reference date, the calculated current streak SHALL equal the count of consecutive days with completions leading up to the reference date, and SHALL be zero if the reference date has no completion.

**Validates: Requirements 4.1, 4.2, 4.6**

### Property 11: Weekly Streak Calculation Correctness

*For any* weekly habit with any target count, any completion history, and any reference date, the calculated current streak SHALL equal the count of consecutive weeks where completions meet or exceed the target, and SHALL be zero if the reference week fails to meet the target.

**Validates: Requirements 4.3, 4.4, 4.6**

### Property 12: Streak Reference Date Sensitivity

*For any* habit with any completion history, calculating the streak with different reference dates SHALL produce different streak values when the completion patterns differ between those reference dates.

**Validates: Requirements 4.5**

### Property 13: Streak Response Completeness

*For any* habit with any completion history, the streak data response SHALL include both currentStreak and longestStreak fields with non-negative integer values.

**Validates: Requirements 4.7**

### Property 14: Heatmap Data Accuracy

*For any* user with any completion history and any date range, the heatmap data SHALL accurately represent the completion frequency for each date, with count values matching the actual number of completions.

**Validates: Requirements 5.2**

### Property 15: Dashboard Statistics Accuracy

*For any* user state with any number of habits and any completion history, the dashboard statistics SHALL correctly aggregate totalHabits count, activeStreaks count, and averageCompletionRate percentage.

**Validates: Requirements 5.3**

### Property 16: Completion Rate Calculation

*For any* habit with any completion history and any date range, the calculated completion rate SHALL equal (actual completions / expected completions) × 100, where expected completions are determined by the habit's frequency and the date range.

**Validates: Requirements 5.4**

### Property 17: Multi-Habit Analytics Aggregation

*For any* user with any number of habits (including zero), dashboard metrics SHALL correctly aggregate data across all habits without double-counting or omissions.

**Validates: Requirements 5.5**

### Property 18: Analytics Date Range Filtering

*For any* analytics query with any date range filter, the returned data SHALL include only completions, habits, and statistics within the specified date range.

**Validates: Requirements 5.6**

### Property 19: Heatmap Format Consistency

*For any* heatmap data generation, each entry SHALL be formatted as an object with a date field (ISO 8601 string) and a count field (non-negative integer).

**Validates: Requirements 5.7**

### Property 20: Validation Error Response Format

*For any* validation failure from any endpoint, the response SHALL have a 400 status code and SHALL include a JSON body with an error field containing validation details.

**Validates: Requirements 7.2, 10.5**

### Property 21: Frequency Enum Validation

*For any* string value that is not exactly "daily" or "weekly", validation of the frequency field SHALL reject the value with an appropriate error message.

**Validates: Requirements 7.5**

### Property 22: Conditional Target Count Validation

*For any* weekly habit creation request, the validation SHALL require targetCount to be present and to be a positive integer, and SHALL reject requests where targetCount is missing, negative, zero, or non-integer.

**Validates: Requirements 7.6**

### Property 23: Date Format Validation

*For any* date string in an invalid format (not ISO 8601), validation SHALL reject the input with an appropriate error message.

**Validates: Requirements 7.7**

### Property 24: Configuration Validation

*For any* configuration state where one or more required environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, JWT_SECRET) are missing, the application SHALL exit with an error message identifying the missing variable.

**Validates: Requirements 8.3, 8.4, 8.5, 12.5**

### Property 25: Not Found Error Consistency

*For any* resource type (habit, log) and any request for a non-existent resource ID, the response SHALL have a 404 status code with a standardized error message.

**Validates: Requirements 10.4**

### Property 26: Error Logging Completeness

*For any* error that occurs during request processing, the system SHALL log the error with a stack trace for debugging purposes.

**Validates: Requirements 10.6**

### Property 27: Error Response Sanitization

*For any* error response, sensitive information (database details, stack traces, environment variables) SHALL NOT be included in the response body sent to the client.

**Validates: Requirements 10.7**

### Property 28: Success Response Format Consistency

*For any* successful operation, the response SHALL have a status code in the 200-299 range and SHALL include a JSON body with a data field containing the result.

**Validates: Requirements 11.1**

### Property 29: Error Response Format Consistency

*For any* failed operation, the response SHALL have an appropriate error status code (400, 401, 403, 404, 500) and SHALL include a JSON body with an error field containing error details.

**Validates: Requirements 11.2**

### Property 30: HTTP Status Code Correctness

*For any* operation outcome (success, validation failure, authentication failure, authorization failure, not found, server error), the response SHALL include the HTTP status code that correctly represents that outcome.

**Validates: Requirements 11.3**

### Property 31: List Response Format

*For any* endpoint that returns multiple resources (habits list, logs list), the response data field SHALL contain an array, even when the array is empty.

**Validates: Requirements 11.4**

### Property 32: Single Resource Response Format

*For any* endpoint that returns a single resource (one habit, one log), the response data field SHALL contain an object with the resource properties.

**Validates: Requirements 11.5**

### Property 33: JSON Field Naming Convention

*For any* JSON response, all field names SHALL be in camelCase format (first word lowercase, subsequent words capitalized, no underscores or hyphens).

**Validates: Requirements 11.6**

### Property 34: Timestamp Format Consistency

*For any* response containing timestamp fields (createdAt, updatedAt, completionDate), the timestamp values SHALL be formatted as ISO 8601 strings.

**Validates: Requirements 11.7**

## Future Enhancements

### Potential Features
- **Habit Templates**: Pre-defined habit templates for common goals
- **Reminders**: Push notifications or email reminders for habits
- **Social Features**: Share progress, follow friends, leaderboards
- **Advanced Analytics**: Trend analysis, prediction models, insights
- **Habit Categories**: Organize habits by category (health, productivity, etc.)
- **Habit Notes**: Add notes to log entries for context
- **Recurring Patterns**: Support for custom frequencies (every 3 days, etc.)
- **Data Export**: Export habit data in CSV or JSON format
- **Achievements**: Gamification with badges and milestones

### Scalability Considerations
- **Caching Layer**: Redis for dashboard and analytics caching
- **Background Jobs**: Queue system for async analytics calculations
- **Read Replicas**: Database read replicas for analytics queries
- **API Versioning**: Version API endpoints for backward compatibility
- **Microservices**: Split analytics into separate service if needed

