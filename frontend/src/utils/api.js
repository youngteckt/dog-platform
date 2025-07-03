// /frontend/src/utils/api.js

// Use the VITE_API_URL from the environment variables for production,
// but fall back to the relative /api path for local development (which uses the proxy).
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Cache configuration
const CACHE_KEY = 'dogs_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Helper function to get cached data from localStorage
 * @returns {object|null} - Cached data or null if not found/invalid
 */
export const getCachedData = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
};

/**
 * Helper function to set cached data in localStorage
 * @param {any} data - Data to cache
 */
export const setCachedData = (data) => {
  try {
    const cacheData = {
      data: data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error setting cache:', error);
  }
};

/**
 * Helper function to check if localStorage cache is valid
 * @param {object} cacheData - Cached data object
 * @returns {boolean} - True if cache is valid
 */
export const isCacheValid = (cacheData) => {
  return cacheData && cacheData.timestamp && (Date.now() - cacheData.timestamp) < CACHE_TTL;
};

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