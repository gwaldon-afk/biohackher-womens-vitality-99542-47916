/**
 * TEST MODE CONFIGURATION
 * 
 * Set TEST_MODE_ENABLED to true to bypass authentication for testing.
 * This allows you to access all pages without logging in.
 * 
 * IMPORTANT: Set this back to false before deploying to production!
 * 
 * To re-enable authentication:
 * Change TEST_MODE_ENABLED = true to TEST_MODE_ENABLED = false
 */

export const TEST_MODE_ENABLED = true;

// Mock user data for testing
export const MOCK_USER = {
  id: 'test-user-id-12345',
  email: 'test@example.com',
  user_metadata: {
    preferred_name: 'Test User',
  },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  app_metadata: {},
  role: 'authenticated',
};

export const MOCK_PROFILE = {
  id: 'test-profile-id-12345',
  user_id: 'test-user-id-12345',
  preferred_name: 'Test User',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  country: 'US',
  language: 'en-US',
  currency: 'USD',
  measurement_system: 'imperial',
  timezone: 'America/New_York',
};
