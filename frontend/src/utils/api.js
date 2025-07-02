// /frontend/src/utils/api.js

// Use the VITE_API_URL from the environment variables for production,
// but fall back to the relative /api path for local development (which uses the proxy).
const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * A centralized fetch wrapper for making API calls.
 * @param {string} path - The API endpoint path (e.g., '/dogs').
 * @param {object} options - Optional fetch options (e.g., method, headers, body).
 * @returns {Promise<any>} - The JSON response from the API.
 */
export const apiFetch = async (path, options = {}) => {
  const url = `${API_URL}${path}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers: defaultHeaders,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      // Try to parse error message from response body, otherwise use status text
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    // Handle responses that might not have a body (like a 204 No Content)
    if (response.status === 204) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error(`API call to ${url} failed:`, error);
    // Re-throw the error so the calling component can handle it
    throw error;
  }
};