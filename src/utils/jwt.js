/** Decodes (does NOT verify) a JWT payload. Used only to know if/when the session expires. The backend verifies tokens. */
export function decodeToken(token) {
  try {
    const part = token.split('.')[1];
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(b64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isExpired(payload) {
  return !payload || (payload.exp ? payload.exp * 1000 <= Date.now() : false);
}
