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

export const TEST_MODE_ENABLED = false;

// Mock user data for testing - using valid UUID format
export const MOCK_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "test@example.com",
  user_metadata: {
    preferred_name: "Test User",
  },
  aud: "authenticated",
  created_at: new Date().toISOString(),
  app_metadata: {},
  role: "authenticated",
};

export const MOCK_PROFILE = {
  id: "00000000-0000-0000-0000-000000000002",
  user_id: "00000000-0000-0000-0000-000000000001",
  preferred_name: "Test User",
  email: "test@example.com",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  country: "US",
  language: "en-US",
  currency: "USD",
  measurement_system: "imperial",
  timezone: "America/New_York",
  onboarding_completed: true,
  device_permissions: {
    camera: false,
    microphone: false,
    light_sensor: false,
    motion: false,
  },
  hormone_compass_enabled: false,
  energy_loop_enabled: false,
};
