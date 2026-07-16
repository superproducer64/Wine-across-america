// Supabase recovery links redirect to `pouracrossamerica://reset-password` with
// auth params in the URL hash fragment (implicit flow) rather than the query
// string, so we split on '#'/'?' manually instead of relying on `URL` parsing
// (which is unreliable for custom-scheme URLs across platforms).

export type RecoveryLinkParams =
  | { kind: 'tokens'; accessToken: string; refreshToken: string }
  | { kind: 'error'; message: string }
  | null;

export function parseRecoveryParamsFromUrl(url: string): RecoveryLinkParams {
  if (!url.includes('reset-password')) return null;

  const fragment = url.includes('#') ? url.split('#')[1] : '';
  const query = url.includes('?') ? url.split('?')[1].split('#')[0] : '';
  const params = new URLSearchParams(fragment || query);

  const errorDescription = params.get('error_description') || params.get('error');
  if (errorDescription) {
    return { kind: 'error', message: decodeURIComponent(errorDescription.replace(/\+/g, ' ')) };
  }

  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const type = params.get('type');

  if (type === 'recovery' && accessToken && refreshToken) {
    return { kind: 'tokens', accessToken, refreshToken };
  }

  return null;
}
