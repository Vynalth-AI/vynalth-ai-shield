/**
 * Helper to dynamically determine the absolute backend API base URL.
 * If the application is embedded or rewritten on sleepsomno.com (or any other domain),
 * it routes requests to https://vitashield.sleepsomno.com.
 * Otherwise, it uses relative paths (for standalone console deployments).
 */
export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host && !host.includes('vitashield') && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      return 'https://vitashield.sleepsomno.com';
    }
  }
  return '';
};
