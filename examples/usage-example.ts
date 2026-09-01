/**
 * Real-world usage examples of the Configuration Service
 * 
 * These examples show how the configuration service will be used
 * throughout the habit tracker backend application.
 */

import ConfigService, { supabaseAdmin, supabasePublic } from '../src/config';

// Example 1: Application Bootstrap (server.ts)
export function bootstrapServer() {
  console.log('🚀 Starting Habit Tracker Backend...');
  
  // Load configuration first thing
  const config = ConfigService.load();
  console.log(`Server will run on port ${config.server.port}`);
  console.log(`Environment: ${config.server.nodeEnv}`);
  
  // Now Express server can use config.server.port
  // and other services can access the configuration
}

// Example 2: Database Setup Script Usage
export async function setupDatabase() {
  console.log('🗄️ Setting up database...');
  
  // Use admin client for setup operations
  const supabase = supabaseAdmin();
  
  // Create tables, RLS policies, etc.
  const { error } = await supabase
    .from('habits')
    .select('*')
    .limit(1);
    
  if (error) {
    console.log('Database setup needed');
  } else {
    console.log('Database already configured');
  }
}

// Example 3: Repository Layer Usage 
export class HabitRepository {
  private supabase = supabasePublic(); // Use public client for user operations
  
  async createHabit(userId: string, habitData: any) {
    // This will use RLS policies and user context
    const { data, error } = await this.supabase
      .from('habits')
      .insert({ ...habitData, user_id: userId })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
}

// Example 4: Auth Service Usage
export class AuthService {
  private jwtSecret = ConfigService.get().jwt.secret;
  private supabase = supabasePublic();
  
  async validateToken(token: string) {
    // Use JWT secret for token validation
    // Use public client for auth operations
    const { data, error } = await this.supabase.auth.getUser(token);
    return { data, error };
  }
}

// Example 5: Testing Setup
export function setupTestEnvironment() {
  // Reset configuration for clean test state
  ConfigService.reset();
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.SUPABASE_URL = 'https://test.supabase.co';
  // ... other test vars
  
  // Reload configuration for tests
  const testConfig = ConfigService.load();
  return testConfig;
}

// Example 6: Middleware Usage
export function createAuthMiddleware() {
  return async (req: any, res: any, next: any) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      // Use public client to validate token
      const supabase = supabasePublic();
      const { data, error } = await supabase.auth.getUser(token);
      
      if (error || !data.user) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      req.user = data.user;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Authentication failed' });
    }
  };
}

// Example 7: Environment-specific Configuration
export function getEnvironmentInfo() {
  const config = ConfigService.get();
  
  return {
    isDevelopment: config.server.nodeEnv === 'development',
    isProduction: config.server.nodeEnv === 'production',
    isTest: config.server.nodeEnv === 'test',
    port: config.server.port,
    supabaseUrl: config.supabase.url
  };
}

// Example 8: Graceful Shutdown
export function gracefulShutdown() {
  console.log('🔄 Shutting down gracefully...');
  
  // Clean up Supabase connections if needed
  // Configuration service handles cleanup internally
  
  console.log('✅ Shutdown complete');
}