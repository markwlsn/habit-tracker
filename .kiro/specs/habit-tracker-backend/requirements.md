# Requirements Document

## Introduction

This document specifies the requirements for a Habit Tracker backend system built on Supabase (PostgreSQL with Row Level Security), providing REST API endpoints for user authentication, habit management, habit logging, streak calculation, and analytics. The system uses TypeScript with a service layer architecture (Controller → Service → Repository) and includes automated setup capabilities.

## Glossary

- **Backend_System**: The Node.js + Express + TypeScript server application that provides REST API endpoints
- **Database**: The Supabase PostgreSQL database with Row Level Security policies
- **Auth_System**: The Supabase Auth built-in authentication system
- **User**: An authenticated account holder who can create and track habits
- **Habit**: A user-defined activity to be tracked with a specific frequency (daily or weekly)
- **Habit_Log**: A record of a single completion instance for a habit
- **Streak**: A count of consecutive periods (days or weeks) where habit targets were met
- **Daily_Habit**: A habit tracked on a per-day basis
- **Weekly_Habit**: A habit tracked on a per-week basis with a target completion count
- **Setup_Script**: An automated script that configures the Supabase database and validates configuration
- **RLS_Policy**: Row Level Security policy that enforces data access rules at the database level
- **Validator**: The zod library used for request data validation
- **Analytics_Dashboard**: An aggregated endpoint providing heatmap data, statistics, and insights

## Requirements

### Requirement 1: User Authentication

**User Story:** As a user, I want to register and authenticate securely, so that my habit data remains private and accessible only to me

#### Acceptance Criteria

1. THE Auth_System SHALL use Supabase Auth for user registration and authentication
2. WHEN a user registers, THE Auth_System SHALL create a user account with email and password
3. WHEN a user logs in, THE Auth_System SHALL return a JWT access token
4. WHEN a user logs out, THE Auth_System SHALL invalidate the session
5. THE Backend_System SHALL validate JWT tokens for all protected endpoints
6. THE Database SHALL enforce RLS_Policy to ensure users can only access their own data

### Requirement 2: Habit Management

**User Story:** As a user, I want to create, read, update, and delete habits, so that I can customize my tracking system

#### Acceptance Criteria

1. WHEN a user creates a habit, THE Backend_System SHALL validate the request using the Validator
2. WHEN creating a Daily_Habit, THE Backend_System SHALL store the habit with frequency set to daily
3. WHEN creating a Weekly_Habit, THE Backend_System SHALL store the habit with frequency set to weekly and a target completion count
4. THE Backend_System SHALL require habit name, description, and frequency for habit creation
5. WHEN a user requests their habits, THE Backend_System SHALL return all habits owned by that user
6. WHEN a user updates a habit, THE Backend_System SHALL modify only the specified fields
7. WHEN a user deletes a habit, THE Backend_System SHALL remove the habit and all associated Habit_Log records
8. THE Database SHALL store habit data with user_id, name, description, frequency, target_count, and timestamps

### Requirement 3: Habit Logging

**User Story:** As a user, I want to log habit completions, so that I can track my progress over time

#### Acceptance Criteria

1. WHEN a user logs a habit completion, THE Backend_System SHALL validate the request using the Validator
2. WHEN logging a Daily_Habit completion, THE Backend_System SHALL record the completion with the current date
3. WHEN logging a Weekly_Habit completion, THE Backend_System SHALL record the completion with the current date and week identifier
4. THE Backend_System SHALL prevent duplicate logs for the same habit and date
5. WHEN a user requests habit logs, THE Backend_System SHALL return logs filtered by habit_id and optional date range
6. WHEN a user deletes a habit log, THE Backend_System SHALL remove the specific Habit_Log record
7. THE Database SHALL store log data with habit_id, user_id, completion_date, and timestamps

### Requirement 4: Streak Calculation

**User Story:** As a user, I want to see my current streaks, so that I stay motivated to maintain consistent habits

#### Acceptance Criteria

1. WHEN calculating a Daily_Habit streak, THE Backend_System SHALL count consecutive days with at least one completion
2. WHEN a Daily_Habit has no completion for a day, THE Backend_System SHALL reset the streak to zero
3. WHEN calculating a Weekly_Habit streak, THE Backend_System SHALL count consecutive weeks where completions meet or exceed the target count
4. WHEN a Weekly_Habit fails to meet the target count in a week, THE Backend_System SHALL reset the streak to zero
5. THE Backend_System SHALL calculate streaks based on the current date as the reference point
6. THE Backend_System SHALL not apply grace periods for missed days or weeks
7. WHEN a user requests streak data, THE Backend_System SHALL return current_streak and longest_streak for each habit

### Requirement 5: Analytics and Dashboard

**User Story:** As a user, I want to view analytics and insights about my habits, so that I can understand my progress patterns

#### Acceptance Criteria

1. THE Backend_System SHALL provide a single dashboard endpoint at /api/analytics/dashboard
2. WHEN a user requests the dashboard, THE Backend_System SHALL return heatmap data showing completion frequency over time
3. WHEN a user requests the dashboard, THE Backend_System SHALL return statistics including total habits, active streaks, and completion rates
4. WHEN a user requests the dashboard, THE Backend_System SHALL calculate completion rates as a percentage of expected completions
5. THE Backend_System SHALL aggregate data across all user habits for dashboard metrics
6. THE Backend_System SHALL support optional date range filters for analytics queries
7. WHEN generating heatmap data, THE Backend_System SHALL format output with date and completion count pairs

### Requirement 6: Service Layer Architecture

**User Story:** As a developer, I want a clear separation of concerns, so that the codebase is maintainable and testable

#### Acceptance Criteria

1. THE Backend_System SHALL implement a Controller layer that handles HTTP requests and responses
2. THE Backend_System SHALL implement a Service layer that contains business logic
3. THE Backend_System SHALL implement a Repository layer that handles database operations
4. WHEN a request is received, THE Controller SHALL validate input, call the Service, and format the response
5. WHEN business logic executes, THE Service SHALL coordinate operations and call the Repository
6. WHEN data access is needed, THE Repository SHALL execute database queries using the Supabase client
7. THE Backend_System SHALL use TypeScript interfaces to define contracts between layers

### Requirement 7: Data Validation

**User Story:** As a developer, I want comprehensive input validation, so that invalid data is rejected before processing

#### Acceptance Criteria

1. THE Backend_System SHALL use the Validator for all request body validation
2. WHEN validation fails, THE Backend_System SHALL return a 400 status code with error details
3. THE Validator SHALL enforce required fields for habit creation (name, description, frequency)
4. THE Validator SHALL enforce data types for all input fields
5. THE Validator SHALL validate that frequency is either "daily" or "weekly"
6. WHEN frequency is weekly, THE Validator SHALL require target_count to be a positive integer
7. THE Validator SHALL validate date formats for habit log queries

### Requirement 8: Automated Setup

**User Story:** As a developer, I want an automated setup process, so that I can quickly configure the development environment

#### Acceptance Criteria

1. THE Setup_Script SHALL create all required database tables in the Database
2. THE Setup_Script SHALL create RLS_Policy rules for all tables
3. THE Setup_Script SHALL validate that Supabase configuration values are present
4. WHEN Supabase URL is missing, THE Setup_Script SHALL exit with an error message
5. WHEN Supabase API key is missing, THE Setup_Script SHALL exit with an error message
6. THE Setup_Script SHALL test database connectivity before creating tables
7. WHEN setup completes successfully, THE Setup_Script SHALL output a confirmation message

### Requirement 9: Testing Infrastructure

**User Story:** As a developer, I want comprehensive test coverage, so that I can confidently make changes without breaking functionality

#### Acceptance Criteria

1. THE Backend_System SHALL include unit tests for Service layer functions using Jest
2. THE Backend_System SHALL include integration tests for API endpoints using Supertest
3. THE Backend_System SHALL mock database calls in unit tests
4. WHEN running integration tests, THE Backend_System SHALL use a test database instance
5. THE Backend_System SHALL test authentication flows including registration, login, and logout
6. THE Backend_System SHALL test all CRUD operations for habits and logs
7. THE Backend_System SHALL test streak calculation logic with various scenarios

### Requirement 10: Error Handling

**User Story:** As a user, I want clear error messages, so that I understand what went wrong and how to fix it

#### Acceptance Criteria

1. WHEN a database error occurs, THE Backend_System SHALL return a 500 status code with a generic error message
2. WHEN authentication fails, THE Backend_System SHALL return a 401 status code
3. WHEN authorization fails, THE Backend_System SHALL return a 403 status code
4. WHEN a resource is not found, THE Backend_System SHALL return a 404 status code
5. WHEN validation fails, THE Backend_System SHALL return a 400 status code with validation error details
6. THE Backend_System SHALL log all errors with stack traces for debugging
7. THE Backend_System SHALL not expose sensitive information in error responses

### Requirement 11: API Response Format

**User Story:** As a developer, I want consistent API response formats, so that client applications can reliably parse responses

#### Acceptance Criteria

1. WHEN an operation succeeds, THE Backend_System SHALL return a JSON response with a data field
2. WHEN an operation fails, THE Backend_System SHALL return a JSON response with an error field
3. THE Backend_System SHALL include appropriate HTTP status codes for all responses
4. WHEN returning lists, THE Backend_System SHALL use an array format in the data field
5. WHEN returning single resources, THE Backend_System SHALL use an object format in the data field
6. THE Backend_System SHALL use camelCase for all JSON field names
7. THE Backend_System SHALL include timestamps in ISO 8601 format

### Requirement 12: Runtime Configuration

**User Story:** As a developer, I want environment-based configuration, so that I can deploy to different environments without code changes

#### Acceptance Criteria

1. THE Backend_System SHALL read Supabase URL from environment variables
2. THE Backend_System SHALL read Supabase API key from environment variables
3. THE Backend_System SHALL read server port from environment variables with a default of 3000
4. THE Backend_System SHALL read Node environment from environment variables with a default of development
5. WHEN required environment variables are missing, THE Backend_System SHALL exit with an error message at startup
6. THE Backend_System SHALL use Node.js LTS version
7. THE Backend_System SHALL manage dependencies using npm
