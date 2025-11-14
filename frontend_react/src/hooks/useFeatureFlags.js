import { useMemo } from 'react';

/**
 * Parses feature flags from environment variables.
 * REACT_APP_FEATURE_FLAGS: comma-separated list like "charts,newFilters"
 * REACT_APP_EXPERIMENTS_ENABLED: "true"/"false"
 */
// PUBLIC_INTERFACE
export function useFeatureFlags() {
  /** Hook returning feature flags and experiments state derived from env. */
  const flagsStr = process.env.REACT_APP_FEATURE_FLAGS || '';
  const experimentsEnabled = String(process.env.REACT_APP_EXPERIMENTS_ENABLED || '').toLowerCase() === 'true';

  const flags = useMemo(() => {
    const obj = {};
    flagsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((f) => (obj[f] = true));
    // sensible default: enable charts unless explicitly disabled
    if (obj.charts === undefined) obj.charts = true;
    return obj;
  }, [flagsStr]);

  return { flags, experimentsEnabled };
}
