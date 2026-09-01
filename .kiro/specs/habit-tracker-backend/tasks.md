# Implementation Plan: Habit Tracker Backend

## Overview

This implementation plan breaks down the three-layer TypeScript/Express/Supabase architecture into discrete coding tasks. The system includes 4 controllers, 5 services, 2 repositories, middleware components, and comprehensive testing. Each task builds incrementally, with early validation through automated tests and property-based testing for correctness properties.

## Tasks

- [x] 1. Project setup and configuration
  - Initialize Node.js project with TypeScript
  - Install dependencies: express, @supabase/supabase-js, zod, jest, supertest, dotenv, fast-check
  - Configure TypeScript with strict mode
  - Create directory structure: src/controllers, src/services, src/repositories, src/middleware, src/types, src/config, src/utils, tests
  - Set up environment variable configuration with validation
  - Create .env.example with required variables
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

- [ ] 2. Database schema and setup script
  - [ ] 2.1 Create database setup script (setup.ts)
    - Implement environment variable validation function
    - Implement Supabase client initialization
    - Implement database connectivity test
    - Create SQL migrations for habits and habit_logs tables
    - Create indexes for performance optimization
    - Add verification step to confirm setup
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_
  
  - [ ] 2.2 Create Row Level Security policies
    - Implement RLS policies for habits table (SELECT, INSERT, UPDATE, DELETE)
    - Implement RLS policies for habit_logs table (SELECT, INSERT, DELETE)
    - Add RLS policy application to setup script
    - _Requirements: 1.6_
  
  - [ ]* 2.3 Write unit tests for setup script
    - Test environment variable validation
    - Test error handling for missing configuration
    - Test SQL execution logic
    - _Requirements: 8.3, 8.4, 8.5_

- [x] 3. Core type definitions and interfaces
  - Create TypeScript interfaces for domain models (Habit, HabitLog, User, StreakData)
  - Create DTO interfaces (CreateHabitDTO, UpdateHabitDTO, CreateLogDTO, DateRange)
  - Create response format interfaces (SuccessResponse, ErrorResponse)
  - Create dashboard-specific interfaces (HeatmapEntry, Statistics, DashboardData)
  - Define error classes (AppError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError, DuplicateError, DatabaseError)
  - _Requirements: 6.7, 10.1, 10.2, 10.3, 10.4, 10.5, 11.1, 11.2_

- [ ] 4. Configuration service and Supabase client
  - Implement ConfigService with environment variable loading
  - Add validation for required environment variables
  - Create Supabase client factory with configuration
  - Export singleton instances for app-wide use
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 5. Validation schemas with Zod
  - Create RegisterSchema and LoginSchema for authentication
  - Create CreateHabitSchema with conditional targetCount validation
  - Create UpdateHabitSchema for partial updates
  - Create CreateLogSchema with optional completion date
  - Create DateRangeSchema for analytics filtering
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [ ]* 5.1 Write property tests for validation schemas
  - **Property 3: Habit Validation Rejection**
  - **Validates: Requirements 2.1, 2.4, 7.2, 7.3, 7.4**
  - Generate random invalid habit creation requests
  - Verify all invalid requests are rejected with 400 status
  - **Property 21: Frequency Enum Validation**
  - **Validates: Requirements 7.5**
  - Generate random non-enum frequency values
  - Verify all invalid frequencies are rejected
  - **Property 22: Conditional Target Count Validation**
  - **Validates: Requirements 7.6**
  - Generate weekly habits with invalid/missing targetCount
  - Verify all invalid cases are rejected
  - **Property 23: Date Format Validation**
  - **Validates: Requirements 7.7**
  - Generate random invalid date strings
  - Verify all invalid dates are rejected

- [ ] 6. Repository layer implementation
  - [ ] 6.1 Implement HabitRepository
    - Implement create method with Supabase insert
    - Implement findByUserId with filtering
    - Implement findById with single row query
    - Implement update method with partial updates
    - Implement delete method with cascade handling
    - Handle database errors and map to DatabaseError
    - _Requirements: 2.8, 6.6_
  
  - [ ] 6.2 Implement LogRepository
    - Implement create method with duplicate checking
    - Implement findByHabitId with date range filtering
    - Implement findByHabitAndDate for duplicate detection
    - Implement delete method for single log
    - Implement deleteByHabitId for cascade deletes
    - Handle database errors and map to DatabaseError
    - _Requirements: 3.7, 6.6_
  
  - [ ]* 6.3 Write unit tests for repositories
    - Mock Supabase client responses
    - Test all CRUD operations
    - Test error handling paths
    - Test RLS policy enforcement
    - _Requirements: 9.3_

- [ ] 7. Checkpoint - Verify repository layer
  - Ensure all repository tests pass, ask the user if questions arise.

- [ ] 8. Service layer - Authentication
  - [ ] 8.1 Implement AuthService
    - Implement register method using Supabase Auth
    - Implement login method with JWT token return
    - Implement logout method with session invalidation
    - Implement validateToken method for JWT verification
    - Handle authentication errors with proper error types
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ]* 8.2 Write property test for JWT validation
    - **Property 1: JWT Token Validation Consistency**
    - **Validates: Requirements 1.5**
    - Generate various token states (valid, invalid, expired, malformed, missing)
    - Verify correct authorization decisions for all states
    - Verify 401 status for all invalid states
  
  - [ ]* 8.3 Write unit tests for AuthService
    - Test successful registration and login flows
    - Test error cases (invalid credentials, duplicate email)
    - Mock Supabase Auth client
    - _Requirements: 9.1, 9.5_

- [ ] 9. Service layer - Habit management
  - [ ] 9.1 Implement HabitService
    - Implement createHabit method with repository integration
    - Implement getUserHabits method with user filtering
    - Implement getHabitById with ownership validation
    - Implement updateHabit with selective field updates
    - Implement deleteHabit with cascade deletion
    - Throw appropriate errors (NotFoundError, AuthorizationError)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 6.5_
  
  - [ ]* 9.2 Write property test for habit retrieval
    - **Property 4: User Habit Retrieval Correctness**
    - **Validates: Requirements 2.5**
    - Generate multiple users with random habit sets
    - Verify each user retrieves only their own habits
    - Verify no cross-user data leakage
  
  - [ ]* 9.3 Write property test for selective updates
    - **Property 5: Selective Habit Update**
    - **Validates: Requirements 2.6**
    - Generate habits and random field subsets to update
    - Verify only specified fields are modified
    - Verify unspecified fields remain unchanged
  
  - [ ]* 9.4 Write property test for cascading deletion
    - **Property 6: Cascading Habit Deletion**
    - **Validates: Requirements 2.7**
    - Generate habits with random numbers of logs
    - Verify both habit and all logs are deleted
  
  - [ ]* 9.5 Write unit tests for HabitService
    - Test all CRUD operations
    - Test ownership validation
    - Mock HabitRepository calls
    - _Requirements: 9.1_

- [ ] 10. Service layer - Habit logging
  - [ ] 10.1 Implement LogService
    - Implement createLog method with duplicate checking
    - Implement getLogsByHabit with date range filtering
    - Implement deleteLog with ownership validation
    - Implement checkDuplicateLog helper method
    - Throw DuplicateError for duplicate logs
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 6.5_
  
  - [ ]* 10.2 Write property test for duplicate prevention
    - **Property 8: Duplicate Log Prevention**
    - **Validates: Requirements 3.4**
    - Generate habits and attempt multiple logs for same date
    - Verify only first log is preserved
    - Verify subsequent attempts are rejected
  
  - [ ]* 10.3 Write property test for log filtering
    - **Property 9: Log Filtering Correctness**
    - **Validates: Requirements 3.5**
    - Generate logs with random dates
    - Apply various date range filters
    - Verify returned logs match filter criteria exactly
  
  - [ ]* 10.4 Write unit tests for LogService
    - Test log creation and duplicate detection
    - Test date range filtering
    - Mock LogRepository calls
    - _Requirements: 9.1_

- [ ] 11. Service layer - Streak calculation
  - [ ] 11.1 Implement StreakService
    - Implement calculateDailyStreak with consecutive day counting
    - Implement calculateWeeklyStreak with target count checking
    - Implement getStreakForHabit dispatcher method
    - Calculate both current and longest streaks
    - Use reference date for streak calculations
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 6.5_
  
  - [ ]* 11.2 Write property test for daily streak calculation
    - **Property 10: Daily Streak Calculation Correctness**
    - **Validates: Requirements 4.1, 4.2, 4.6**
    - Generate random daily completion histories
    - Verify current streak counts consecutive days correctly
    - Verify streak is zero when reference date has no completion
  
  - [ ]* 11.3 Write property test for weekly streak calculation
    - **Property 11: Weekly Streak Calculation Correctness**
    - **Validates: Requirements 4.3, 4.4, 4.6**
    - Generate random weekly completion histories with various targets
    - Verify streak counts consecutive weeks meeting target
    - Verify streak is zero when week fails to meet target
  
  - [ ]* 11.4 Write property test for reference date sensitivity
    - **Property 12: Streak Reference Date Sensitivity**
    - **Validates: Requirements 4.5**
    - Generate completion history
    - Calculate streaks with different reference dates
    - Verify different dates produce different results
  
  - [ ]* 11.5 Write property test for streak response format
    - **Property 13: Streak Response Completeness**
    - **Validates: Requirements 4.7**
    - Generate various completion histories
    - Verify response includes currentStreak and longestStreak
    - Verify both values are non-negative integers
  
  - [ ]* 11.6 Write unit tests for StreakService
    - Test daily streak with consecutive completions
    - Test daily streak with gaps
    - Test weekly streak with various target counts
    - Test edge cases (empty logs, single completion)
    - _Requirements: 9.1, 9.7_

- [ ] 12. Checkpoint - Verify core services
  - Ensure all service tests pass, ask the user if questions arise.

- [ ] 13. Service layer - Analytics
  - [ ] 13.1 Implement AnalyticsService
    - Implement getDashboardData aggregation method
    - Implement generateHeatmapData with date grouping
    - Implement calculateStatistics across all habits
    - Implement calculateCompletionRate for individual habits
    - Support optional date range filtering
    - Coordinate with HabitService, LogService, and StreakService
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.5_
  
  - [ ]* 13.2 Write property test for heatmap accuracy
    - **Property 14: Heatmap Data Accuracy**
    - **Validates: Requirements 5.2**
    - Generate random completion histories
    - Verify heatmap counts match actual completion frequencies
  
  - [ ]* 13.3 Write property test for dashboard statistics
    - **Property 15: Dashboard Statistics Accuracy**
    - **Validates: Requirements 5.3**
    - Generate various user states with different habit counts
    - Verify totalHabits, activeStreaks, and completion rate accuracy
  
  - [ ]* 13.4 Write property test for completion rate calculation
    - **Property 16: Completion Rate Calculation**
    - **Validates: Requirements 5.4**
    - Generate habits with various frequencies and completion patterns
    - Verify completion rate formula: (actual / expected) × 100
  
  - [ ]* 13.5 Write property test for multi-habit aggregation
    - **Property 17: Multi-Habit Analytics Aggregation**
    - **Validates: Requirements 5.5**
    - Generate users with varying numbers of habits (including zero)
    - Verify no double-counting or omissions in aggregation
  
  - [ ]* 13.6 Write property test for date range filtering
    - **Property 18: Analytics Date Range Filtering**
    - **Validates: Requirements 5.6**
    - Generate completions across wide date range
    - Apply various date range filters
    - Verify only filtered data is returned
  
  - [ ]* 13.7 Write property test for heatmap format
    - **Property 19: Heatmap Format Consistency**
    - **Validates: Requirements 5.7**
    - Generate various heatmap data
    - Verify each entry has date (ISO 8601) and count (integer) fields
  
  - [ ]* 13.8 Write unit tests for AnalyticsService
    - Test dashboard data aggregation
    - Test heatmap generation
    - Test completion rate edge cases
    - Mock service dependencies
    - _Requirements: 9.1_

- [ ] 14. Middleware - Authentication
  - [ ] 14.1 Implement authMiddleware
    - Extract JWT token from Authorization header
    - Validate token using AuthService
    - Attach user object to request
    - Return 401 for invalid/missing tokens
    - _Requirements: 1.5, 10.2_
  
  - [ ]* 14.2 Write integration tests for authMiddleware
    - Test with valid token (should allow request)
    - Test with invalid token (should return 401)
    - Test with missing token (should return 401)
    - Test with expired token (should return 401)
    - _Requirements: 9.2, 9.5_

- [ ] 15. Middleware - Validation
  - [ ] 15.1 Implement validationMiddleware factory
    - Accept Zod schema as parameter
    - Validate request body against schema
    - Return 400 with validation errors if invalid
    - Pass validated data to next middleware if valid
    - _Requirements: 7.1, 7.2_
  
  - [ ]* 15.2 Write property test for validation error format
    - **Property 20: Validation Error Response Format**
    - **Validates: Requirements 7.2, 10.5**
    - Generate various validation failures
    - Verify all return 400 status with error field
  
  - [ ]* 15.3 Write unit tests for validationMiddleware
    - Test with valid request body
    - Test with invalid request body
    - Test with missing fields
    - _Requirements: 9.1_

- [ ] 16. Middleware - Error handling
  - [ ] 16.1 Implement errorMiddleware
    - Catch all thrown errors
    - Log errors with stack traces
    - Map error types to HTTP status codes
    - Return sanitized error responses
    - Remove sensitive information from responses
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_
  
  - [ ]* 16.2 Write property test for not found errors
    - **Property 25: Not Found Error Consistency**
    - **Validates: Requirements 10.4**
    - Generate requests for non-existent resource IDs
    - Verify all return 404 with standardized message
  
  - [ ]* 16.3 Write property test for error sanitization
    - **Property 27: Error Response Sanitization**
    - **Validates: Requirements 10.7**
    - Generate various error types
    - Verify no sensitive information in responses
  
  - [ ]* 16.4 Write unit tests for errorMiddleware
    - Test error type mapping to status codes
    - Test error logging
    - Test sensitive data sanitization
    - _Requirements: 9.1, 10.6_

- [ ] 17. Controller layer - Authentication
  - [ ] 17.1 Implement AuthController
    - Implement register endpoint handler
    - Implement login endpoint handler
    - Implement logout endpoint handler
    - Format responses with success/error wrappers
    - _Requirements: 6.1, 6.4_
  
  - [ ]* 17.2 Write integration tests for auth endpoints
    - Test POST /api/auth/register (success and validation errors)
    - Test POST /api/auth/login (success and invalid credentials)
    - Test POST /api/auth/logout (success and unauthorized)
    - _Requirements: 9.2, 9.5_

- [ ] 18. Controller layer - Habit management
  - [ ] 18.1 Implement HabitController
    - Implement create endpoint handler
    - Implement getAll endpoint handler
    - Implement getById endpoint handler
    - Implement update endpoint handler
    - Implement delete endpoint handler
    - Extract user ID from JWT token
    - _Requirements: 6.1, 6.4_
  
  - [ ]* 18.2 Write property test for success response format
    - **Property 28: Success Response Format Consistency**
    - **Validates: Requirements 11.1**
    - Generate various successful operations
    - Verify all return 2xx status with data field
  
  - [ ]* 18.3 Write property test for error response format
    - **Property 29: Error Response Format Consistency**
    - **Validates: Requirements 11.2**
    - Generate various failure scenarios
    - Verify all return appropriate error status with error field
  
  - [ ]* 18.4 Write property test for HTTP status codes
    - **Property 30: HTTP Status Code Correctness**
    - **Validates: Requirements 11.3**
    - Generate various operation outcomes
    - Verify correct status code for each outcome
  
  - [ ]* 18.5 Write integration tests for habit endpoints
    - Test POST /api/habits (create daily and weekly habits)
    - Test GET /api/habits (list user habits)
    - Test GET /api/habits/:id (single habit retrieval)
    - Test PUT /api/habits/:id (update habit)
    - Test DELETE /api/habits/:id (delete habit with logs)
    - _Requirements: 9.2, 9.6_

- [ ] 19. Controller layer - Habit logging
  - [ ] 19.1 Implement LogController
    - Implement create endpoint handler with duplicate prevention
    - Implement getByHabit endpoint handler with date filtering
    - Implement delete endpoint handler
    - Extract user ID from JWT token
    - _Requirements: 6.1, 6.4_
  
  - [ ]* 19.2 Write property test for list response format
    - **Property 31: List Response Format**
    - **Validates: Requirements 11.4**
    - Generate various list endpoints
    - Verify data field contains array (even when empty)
  
  - [ ]* 19.3 Write property test for single resource format
    - **Property 32: Single Resource Response Format**
    - **Validates: Requirements 11.5**
    - Generate single resource endpoints
    - Verify data field contains object
  
  - [ ]* 19.4 Write integration tests for log endpoints
    - Test POST /api/logs (create log with duplicate prevention)
    - Test GET /api/logs/:habitId (retrieve logs with date filtering)
    - Test DELETE /api/logs/:id (delete single log)
    - _Requirements: 9.2, 9.6_

- [ ] 20. Controller layer - Analytics
  - [ ] 20.1 Implement AnalyticsController
    - Implement getDashboard endpoint handler
    - Support optional date range query parameters
    - Extract user ID from JWT token
    - Format comprehensive dashboard response
    - _Requirements: 6.1, 6.4_
  
  - [ ] 20.2 Add streak endpoint to HabitController
    - Implement getStreak endpoint handler for individual habits
    - Return current and longest streak
    - _Requirements: 6.1, 6.4_
  
  - [ ]* 20.3 Write property test for JSON field naming
    - **Property 33: JSON Field Naming Convention**
    - **Validates: Requirements 11.6**
    - Generate various JSON responses
    - Verify all field names are in camelCase
  
  - [ ]* 20.4 Write property test for timestamp format
    - **Property 34: Timestamp Format Consistency**
    - **Validates: Requirements 11.7**
    - Generate various responses with timestamps
    - Verify all timestamps are in ISO 8601 format
  
  - [ ]* 20.5 Write integration tests for analytics endpoints
    - Test GET /api/analytics/dashboard (with and without date filters)
    - Test GET /api/habits/:id/streak (streak calculation)
    - _Requirements: 9.2_

- [ ] 21. Express application setup and routing
  - Create Express app instance
  - Configure middleware stack (JSON parsing, CORS, error handling)
  - Define authentication routes (/api/auth/*)
  - Define habit management routes (/api/habits/*)
  - Define logging routes (/api/logs/*)
  - Define analytics routes (/api/analytics/*)
  - Apply authMiddleware to protected routes
  - Apply validationMiddleware with appropriate schemas
  - Wire up all controllers
  - _Requirements: 6.1, 6.2, 6.4_

- [ ] 22. Server entry point and startup
  - Create server.ts with app initialization
  - Load configuration using ConfigService
  - Start Express server on configured port
  - Add graceful shutdown handling
  - Log startup information
  - _Requirements: 12.3, 12.4_

- [ ] 23. Checkpoint - Verify complete API
  - Run all unit tests and ensure they pass
  - Run all integration tests and ensure they pass
  - Run all property tests and ensure they pass
  - Test manual API flows with Postman or curl
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 24. Property-based test for Row Level Security
  - [ ]* 24.1 Write integration property test for RLS isolation
    - **Property 2: Row Level Security Isolation**
    - **Validates: Requirements 1.6**
    - Generate multiple users with habits and logs
    - Verify each user can only access their own data
    - Verify cross-user access attempts fail
    - _Requirements: 9.2, 9.4_

- [ ] 25. Property-based test for data persistence
  - [ ]* 25.1 Write integration property test for data completeness
    - **Property 7: Data Persistence Completeness**
    - **Validates: Requirements 2.8, 3.7**
    - Generate random habit and log creation requests
    - Verify all stored records contain required fields
    - Verify field values match input values
    - _Requirements: 9.2_

- [ ] 26. Property-based test for configuration validation
  - [ ]* 26.1 Write unit property test for config validation
    - **Property 24: Configuration Validation**
    - **Validates: Requirements 8.3, 8.4, 8.5, 12.5**
    - Generate various missing environment variable scenarios
    - Verify application exits with appropriate error message
    - _Requirements: 9.1_

- [ ] 27. Documentation and examples
  - Create README.md with project overview
  - Document API endpoints with request/response examples
  - Create setup instructions with environment variable guide
  - Add usage examples for common workflows
  - Document testing strategy and how to run tests
  - Add contribution guidelines
  - _Requirements: 8.7_

- [ ] 28. Development tooling and scripts
  - Add npm scripts for common tasks (dev, build, test, setup)
  - Configure Jest with coverage reporting
  - Add ESLint configuration for code quality
  - Add Prettier configuration for code formatting
  - Create .gitignore with appropriate exclusions
  - _Requirements: 12.7_

- [ ] 29. Final integration testing
  - [ ]* 29.1 Run full end-to-end test suite
    - Test complete user registration → habit creation → logging → analytics flow
    - Test authentication and authorization across all endpoints
    - Test error handling and edge cases
    - Verify database state after operations
    - _Requirements: 9.2, 9.4_

- [ ] 30. Final checkpoint - Production readiness
  - Verify all tests pass (unit, integration, property-based)
  - Verify setup script runs successfully
  - Verify all environment variables are documented
  - Review code for security issues
  - Confirm RLS policies are active and working
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests use fast-check library with minimum 100 iterations
- All tests tagged with format: `Feature: habit-tracker-backend, Property {number}: {property_text}`
- Integration tests use a separate test Supabase project instance
- Checkpoints ensure incremental validation throughout implementation
- Setup script should be run before integration tests
- TypeScript strict mode enforces type safety across all layers
- Three-layer architecture (Controller → Service → Repository) ensures clean separation of concerns

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1", "3"] },
    { "id": 1, "tasks": ["2.1", "4", "5"] },
    { "id": 2, "tasks": ["2.2", "2.3", "5.1", "6.1", "6.2"] },
    { "id": 3, "tasks": ["6.3", "8.1", "9.1", "10.1", "11.1"] },
    { "id": 4, "tasks": ["8.2", "8.3", "9.2", "9.3", "9.4", "9.5", "10.2", "10.3", "10.4", "11.2", "11.3", "11.4", "11.5", "11.6", "13.1"] },
    { "id": 5, "tasks": ["13.2", "13.3", "13.4", "13.5", "13.6", "13.7", "13.8", "14.1", "15.1", "16.1"] },
    { "id": 6, "tasks": ["14.2", "15.2", "15.3", "16.2", "16.3", "16.4", "17.1"] },
    { "id": 7, "tasks": ["17.2", "18.1"] },
    { "id": 8, "tasks": ["18.2", "18.3", "18.4", "18.5", "19.1", "20.1", "20.2"] },
    { "id": 9, "tasks": ["19.2", "19.3", "19.4", "20.3", "20.4", "20.5", "21"] },
    { "id": 10, "tasks": ["22", "24.1", "25.1", "26.1"] },
    { "id": 11, "tasks": ["27", "28"] },
    { "id": 12, "tasks": ["29.1"] }
  ]
}
```
