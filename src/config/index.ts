import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Load environment variables from .env file
dotenv.config();

export interface Config {
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

class ConfigService {
  private static instance: Config | null = null;

  static load(): Config {
    if (this.instance) {
      return this.instance;
    }

    // Define required environment variables
    const required = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_KEY',
      'JWT_SECRET'
    ];

    // Check for missing required environment variables
    const missing: string[] = [];
    for (const key of required) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }

    // Exit if any required variables are missing
    if (missing.length > 0) {
      console.error(`ERROR: Missing required environment variables: ${missing.join(', ')}`);
      console.error('Please set these variables in your .env file or environment.');
      process.exit(1);
    }

    // Create and cache the configuration
    this.instance = {
      supabase: {
        url: process.env.SUPABASE_URL!,
        anonKey: process.env.SUPABASE_ANON_KEY!,
        serviceKey: process.env.SUPABASE_SERVICE_KEY!
      },
      server: {
        port: parseInt(process.env.PORT || '3000', 10),
        nodeEnv: process.env.NODE_ENV || 'development'
      },
      jwt: {
        secret: process.env.JWT_SECRET!
      }
    };

    return this.instance;
  }

  static get(): Config {
    if (!this.instance) {
      throw new Error('Configuration not loaded. Call ConfigService.load() first.');
    }
    return this.instance;
  }

  static reset(): void {
    this.instance = null;
  }
}

export default ConfigService;

// Supabase client factory and singleton instances
class SupabaseClientFactory {
  private static adminClient: SupabaseClient | null = null;
  private static publicClient: SupabaseClient | null = null;

  /**
   * Get Supabase admin client with service key for server-side operations
   * Use this for operations that bypass RLS or require admin privileges
   */
  static getAdminClient(): SupabaseClient {
    if (!this.adminClient) {
      const config = ConfigService.get();
      this.adminClient = createClient(
        config.supabase.url,
        config.supabase.serviceKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
    }
    return this.adminClient;
  }

  /**
   * Get Supabase public client with anon key for user-authenticated operations  
   * Use this for operations with RLS policies and user context
   */
  static getPublicClient(): SupabaseClient {
    if (!this.publicClient) {
      const config = ConfigService.get();
      this.publicClient = createClient(
        config.supabase.url,
        config.supabase.anonKey
      );
    }
    return this.publicClient;
  }

  /**
   * Reset clients (useful for testing)
   */
  static reset(): void {
    this.adminClient = null;
    this.publicClient = null;
  }
}

// Export singleton instances for app-wide use
// Wrap the static methods so consumers receive stable, correctly bound getters.
export const supabaseAdmin = (): SupabaseClient => SupabaseClientFactory.getAdminClient();
export const supabasePublic = (): SupabaseClient => SupabaseClientFactory.getPublicClient();
export { SupabaseClientFactory };

/** Creates a client that carries the caller's JWT so PostgreSQL RLS applies. */
export function supabaseForUser(accessToken: string): SupabaseClient {
  const config = ConfigService.get();
  return createClient(config.supabase.url, config.supabase.anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}
