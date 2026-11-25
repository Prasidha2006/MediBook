/**
 * Decode the JWT expiration timestamp in milliseconds without verifying the signature.
 * @param {string|null|undefined} token
 * @returns {number|null} Expiration timestamp in ms, or null if unavailable/invalid.
 */
export function getTokenExpiryMs(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Returns true if the token has a valid exp claim that is in the past.
 * @param {string|null|undefined} token
 * @returns {boolean}
 */
export function isTokenExpired(token) {
  const expMs = getTokenExpiryMs(token);
  return expMs !== null && Date.now() >= expMs;
}
