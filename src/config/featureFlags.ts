/**
 * Runtime feature flags.
 *
 * Flags are read from EXPO_PUBLIC_* env vars and default to false.
 * To enable a feature in development, add the corresponding
 * EXPO_PUBLIC_FEATURE_* variable to your .env file.
 *
 * Usage in screens/hooks:
 *   import { FEATURE_NEW_UI } from '../config/featureFlags';
 *   if (FEATURE_NEW_UI) { ... }
 */

function envFlag(key: string): boolean {
  const val = process.env[key];
  if (val === undefined) return true; // default to enabled when unset
  return val === 'true';
}

/** Enable the bear companion feature (default: true). */
export const FEATURE_BEAR = envFlag('EXPO_PUBLIC_FEATURE_BEAR');

/** Enable daily missions (default: true). */
export const FEATURE_MISSIONS = envFlag('EXPO_PUBLIC_FEATURE_MISSIONS');

/** Enable cave furnishing (default: true). */
export const FEATURE_CAVES = envFlag('EXPO_PUBLIC_FEATURE_CAVES');
