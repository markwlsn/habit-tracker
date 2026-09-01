/**
 * Configuration service tests
 */

import ConfigService, { SupabaseClientFactory, supabaseAdmin, supabasePublic } from '../src/config';

describe('ConfigService', () => {
  beforeEach(() => {
    ConfigService.reset();
    SupabaseClientFactory.reset();
  });

  afterEach(() => {
    ConfigService.reset();
    SupabaseClientFactory.reset();
  });

  describe('Environment Variable Validation', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      // Reset modules to ensure clean state
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should load configuration successfully with all required environment variables', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
      process.env.JWT_SECRET = 'test-jwt-secret';
      process.env.PORT = '8000';
      process.env.NODE_ENV = 'test';

      const config = ConfigService.load();

      expect(config.supabase.url).toBe('https://test.supabase.co');
      expect(config.supabase.anonKey).toBe('test-anon-key');
      expect(config.supabase.serviceKey).toBe('test-service-key');
      expect(config.jwt.secret).toBe('test-jwt-secret');
      expect(config.server.port).toBe(8000);
      expect(config.server.nodeEnv).toBe('test');
    });

    it('should use default values for optional environment variables', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
      process.env.JWT_SECRET = 'test-jwt-secret';
      // Jest sets NODE_ENV=test; remove it to verify the application's default.
      delete process.env.PORT;
      delete process.env.NODE_ENV;

      const config = ConfigService.load();

      expect(config.server.port).toBe(3000); // default
      expect(config.server.nodeEnv).toBe('development'); // default
    });

    it('should exit with error when SUPABASE_URL is missing', () => {
      const mockExit = jest.spyOn(process, 'exit').mockImplementation();
      const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

      process.env.SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
      process.env.JWT_SECRET = 'test-jwt-secret';
      // SUPABASE_URL missing

      ConfigService.load();

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Missing required environment variables: SUPABASE_URL')
      );
      expect(mockExit).toHaveBeenCalledWith(1);

      mockExit.mockRestore();
      mockConsoleError.mockRestore();
    });

    it('should exit with error when multiple required variables are missing', () => {
      const mockExit = jest.spyOn(process, 'exit').mockImplementation();
      const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

      // Only provide some variables
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      // SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, JWT_SECRET missing

      ConfigService.load();

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Missing required environment variables: SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, JWT_SECRET')
      );
      expect(mockExit).toHaveBeenCalledWith(1);

      mockExit.mockRestore();
      mockConsoleError.mockRestore();
    });
  });

  describe('Configuration Singleton', () => {
    it('should return the same instance on multiple calls to load()', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
      process.env.JWT_SECRET = 'test-jwt-secret';

      const config1 = ConfigService.load();
      const config2 = ConfigService.load();

      expect(config1).toBe(config2); // Same reference
    });

    it('should throw error when calling get() before load()', () => {
      expect(() => {
        ConfigService.get();
      }).toThrow('Configuration not loaded. Call ConfigService.load() first.');
    });

    it('should return configuration after load() is called', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
      process.env.JWT_SECRET = 'test-jwt-secret';

      const loadedConfig = ConfigService.load();
      const retrievedConfig = ConfigService.get();

      expect(retrievedConfig).toBe(loadedConfig);
    });
  });
});

describe('SupabaseClientFactory', () => {
  beforeEach(() => {
    ConfigService.reset();
    SupabaseClientFactory.reset();
    
    // Set up required environment variables
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
    process.env.JWT_SECRET = 'test-jwt-secret';

    // Load config first
    ConfigService.load();
  });

  afterEach(() => {
    SupabaseClientFactory.reset();
    ConfigService.reset();
  });

  describe('Admin Client', () => {
    it('should create admin client with service key', () => {
      const adminClient = SupabaseClientFactory.getAdminClient();
      
      expect(adminClient).toBeDefined();
      expect(typeof adminClient.auth.getSession).toBe('function');
    });

    it('should return the same admin client instance on multiple calls', () => {
      const client1 = SupabaseClientFactory.getAdminClient();
      const client2 = SupabaseClientFactory.getAdminClient();
      
      expect(client1).toBe(client2);
    });
  });

  describe('Public Client', () => {
    it('should create public client with anon key', () => {
      const publicClient = SupabaseClientFactory.getPublicClient();
      
      expect(publicClient).toBeDefined();
      expect(typeof publicClient.auth.getSession).toBe('function');
    });

    it('should return the same public client instance on multiple calls', () => {
      const client1 = SupabaseClientFactory.getPublicClient();
      const client2 = SupabaseClientFactory.getPublicClient();
      
      expect(client1).toBe(client2);
    });
  });

  describe('Factory Reset', () => {
    it('should create new instances after reset', () => {
      const adminClient1 = SupabaseClientFactory.getAdminClient();
      const publicClient1 = SupabaseClientFactory.getPublicClient();
      
      SupabaseClientFactory.reset();
      
      const adminClient2 = SupabaseClientFactory.getAdminClient();
      const publicClient2 = SupabaseClientFactory.getPublicClient();
      
      expect(adminClient1).not.toBe(adminClient2);
      expect(publicClient1).not.toBe(publicClient2);
    });
  });

  describe('Singleton Export Functions', () => {
    it('should export singleton getter functions', () => {
      expect(typeof supabaseAdmin).toBe('function');
      expect(typeof supabasePublic).toBe('function');
      
      const adminClient = supabaseAdmin();
      const publicClient = supabasePublic();
      
      expect(adminClient).toBeDefined();
      expect(publicClient).toBeDefined();
    });
  });
});
