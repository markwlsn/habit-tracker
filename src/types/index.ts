/**
 * Core Type Definitions and Interfaces
 * Habit Tracker Backend
 */

// ============================================================================
// Domain Models
// ============================================================================

/**
 * Represents a habit tracked by a user
 */
export interface Habit {
  id: string;
  userId: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly';
  targetCount: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents a single completion log entry for a habit
 */
export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  completionDate: Date;
  createdAt: Date;
}

/**
 * Represents a user account
 */
export interface User {
  id: string;
  email: string;
}

/**
 * Represents streak data for a habit
 */
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
}

// ============================================================================
// Data Transfer Objects (DTOs)
// ============================================================================

/**
 * DTO for creating a new habit
 */
export interface CreateHabitDTO {
  name: string;
  description: string;
  frequency: 'daily' | 'weekly';
  targetCount?: number;
}

/**
 * DTO for updating an existing habit
 */
export interface UpdateHabitDTO {
  name?: string;
  description?: string;
  frequency?: 'daily' | 'weekly';
  targetCount?: number;
}

/**
 * DTO for creating a new habit log entry
 */
export interface CreateLogDTO {
  habitId: string;
  completionDate?: Date;
}

/**
 * Represents a date range filter for queries
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// ============================================================================
// API Response Formats
// ============================================================================

/**
 * Standard success response wrapper
 */
export interface SuccessResponse<T> {
  data: T;
}

/**
 * Standard error response wrapper
 */
export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

// ============================================================================
// Dashboard and Analytics Interfaces
// ============================================================================

/**
 * Represents a single entry in the heatmap data
 */
export interface HeatmapEntry {
  date: string; // ISO 8601 format
  count: number;
}

/**
 * Aggregated statistics across all user habits
 */
export interface Statistics {
  totalHabits: number;
  activeStreaks: number;
  averageCompletionRate: number;
}

/**
 * Complete dashboard data payload
 */
export interface DashboardData {
  heatmap: HeatmapEntry[];
  statistics: Statistics;
  habits: Array<Habit & { streak: StreakData }>;
}

// ============================================================================
// Error Classes
// ============================================================================

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Error thrown when request validation fails
 */
export class ValidationError extends AppError {
  constructor(details: unknown) {
    super(400, 'Validation failed', 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error thrown when authentication fails
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(401, message, 'AUTH_ERROR');
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Error thrown when user lacks permission to access resource
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(403, message, 'FORBIDDEN');
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Error thrown when a requested resource is not found
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND');
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Error thrown when attempting to create a duplicate resource
 */
export class DuplicateError extends AppError {
  constructor(message: string) {
    super(409, message, 'DUPLICATE');
    this.name = 'DuplicateError';
    Object.setPrototypeOf(this, DuplicateError.prototype);
  }
}

/**
 * Error thrown when a database operation fails
 */
export class DatabaseError extends AppError {
  constructor() {
    super(500, 'An internal error occurred', 'DATABASE_ERROR');
    this.name = 'DatabaseError';
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}
