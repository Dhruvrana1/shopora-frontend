
import { ENDPOINTS } from './endpoints';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'shopora_token';
const TIMEOUT_MS = 20000;

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const tokenStore = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: (token) => sessionStorage.setItem(TOKEN_KEY, token),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
};

let unauthorizedHandler = null;

export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn;
}

function buildUrl(path, params) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }

  return url.toString();
}

function fallbackMessage(status) {
  if (status === 400) return 'Please check the information you entered.';
  if (status === 401) return 'Your session has expired. Please log in again.';
  if (status === 403) return 'You do not have permission to do that.';
  if (status === 404) return 'We could not find what you were looking for.';
  if (status === 409) return 'This already exists.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status >= 500) return 'Something went wrong on our side. Please try again later.';
  return 'Something went wrong. Please try again.';
}

function extractMessage(data, status) {
  const message =
    data && typeof data === 'object' ? data.message || data.error : null;

  return typeof message === 'string' && message
    ? message
    : fallbackMessage(status);
}

async function fetchResponse(url, options, signal) {
  const controller = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);

  const abortFromCaller = () => controller.abort();

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener('abort', abortFromCaller, { once: true });
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      credentials: 'include',
    });

    return response;
  } catch (error) {
    if (timedOut) {
      throw new ApiError(
        'The server took too long to respond. Please try again.',
        0,
        null
      );
    }

    if (error.name === 'AbortError') throw error;

    throw new ApiError(
      'Cannot reach the server. Check your connection, the API URL, and that the backend is running.',
      0,
      null
    );
  } finally {
    clearTimeout(timer);
    if (signal) {
      signal.removeEventListener('abort', abortFromCaller);
    }
  }
}

async function readResponse(response) {
  if (response.status === 204) return null;

  const type = response.headers.get('content-type') || '';

  try {
    return type.includes('application/json')
      ? await response.json()
      : await response.text();
  } catch {
    return null;
  }
}

async function refreshAccessToken() {
  const endpoint = ENDPOINTS.auth.refresh;

  const response = await fetchResponse(
    buildUrl(endpoint.path),
    {
      method: endpoint.method,
      headers: { Accept: 'application/json' },
    }
  );

  const data = await readResponse(response);

  if (!response.ok || !data?.accessToken) {
    throw new ApiError(
      extractMessage(data, response.status),
      response.status,
      data
    );
  }

  tokenStore.set(data.accessToken);
  return data.accessToken;
}

export async function request(
  path,
  {
    method = 'GET',
    body,
    params,
    auth = true,
    signal,
    retry = true,
  } = {}
) {
  const headers = { Accept: 'application/json' };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = tokenStore.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const url = buildUrl(path, params);

  const response = await fetchResponse(
    url,
    {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    },
    signal
  );

  const data = await readResponse(response);

  if (!response.ok) {
    if (response.status === 401 && auth && retry) {
      try {
        await refreshAccessToken();

        // Retry the original request once with the new access token.
        return request(path, {
          method,
          body,
          params,
          auth,
          signal,
          retry: false,
        });
      } catch (refreshError) {
        tokenStore.clear();

        if (unauthorizedHandler) unauthorizedHandler();

        throw refreshError;
      }
    }

    if (response.status === 401 && auth) {
      tokenStore.clear();
      if (unauthorizedHandler) unauthorizedHandler();
    }

    throw new ApiError(extractMessage(data, response.status), response.status, data);
  }

  return data;
}

/** Example: call(ENDPOINTS.cart.update, { args: [itemId], body }) */
export function call(endpoint, { args = [], ...options } = {}) {
  const path =
    typeof endpoint.path === 'function'
      ? endpoint.path(...args)
      : endpoint.path;

  return request(path, {
    method: endpoint.method,
    ...options,
  });
}

export { ENDPOINTS };
