import { call, tokenStore, ENDPOINTS } from './api';
import { PAYLOADS } from './endpoints';

export function register(values) {
  return call(ENDPOINTS.auth.register, { auth: false, body: PAYLOADS.register(values) });
}

/** Stores the access token (the only thing login returns) and returns it. */
export async function login(values) {
  const data = await call(ENDPOINTS.auth.login, { auth: false, body: PAYLOADS.login(values) });
  const token = data?.accessToken;
  if (!token) throw new Error('Login response did not include an access token.');
  tokenStore.set(token);
  return token;
}

// No logout route exists on the backend. The session is just the local token.
export function logout() {
  tokenStore.clear();
}

export function forgotPassword(values) {
  return call(ENDPOINTS.auth.forgotPassword, { auth: false, body: PAYLOADS.forgotPassword(values) });
}

export function resetPassword(values) {
  return call(ENDPOINTS.auth.resetPassword, { auth: false, body: PAYLOADS.resetPassword(values) });
}

export function verifyEmail(token) {
  return call(ENDPOINTS.auth.verifyEmail, { auth: false, params: { token } });
}
