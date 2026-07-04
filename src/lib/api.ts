/**
 * Helper to dynamically determine the absolute backend API base URL.
 * If the application is embedded or rewritten on sleepsomno.com (or any other domain),
 * it routes requests to https://vitashield.sleepsomno.com.
 * Otherwise, it uses relative paths (for standalone console deployments).
 */
export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // If embedding on client domains (e.g. sleepsomno.com), route to collector domain.
    // Otherwise (localhost, vitashield.sleepsomno.com, or vercel.app preview URL), use relative path.
    if (host && (host.includes('sleepsomno.com') || host.includes('powiismunc.com')) && !host.includes('vitashield')) {
      return 'https://vitashield.sleepsomno.com';
    }
  }
  return '';
};
