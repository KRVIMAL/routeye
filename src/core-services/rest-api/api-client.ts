import axios from 'axios';
import { store } from '../../store';
import { checkTokenExpiry, clearAuthData } from '../../store/slices/auth-slices.store';
import urls from '../../global/constants/UrlConstants';

export const apiClient = axios.create({
  // baseURL: "http://192.168.1.9:9876/", // Updated base URL to match login endpoint
  baseURL:urls.baseURL,
  timeout: 10000, // Increased timeout for better reliabilit
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the accessToken and check expiry
apiClient.interceptors.request.use(
  (config) => {
    // Check token expiry before making request
    store.dispatch(checkTokenExpiry());
    
    // Add Authorization token if available
    const state = store.getState().auth;
    const token = state.accessToken;
    const tokenType = state.tokenType || 'Bearer';
    
    if (token && state.isAuthenticated) {
      config.headers.Authorization = `${tokenType} ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiry and errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Handle unauthorized access (401)
    if (response?.status === 401) {
      console.error('Unauthorized access - token may be expired');
      
      // Clear auth data and redirect to login
      store.dispatch(clearAuthData());
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Handle forbidden access (403)
    if (response?.status === 403) {
      console.error('Forbidden access - insufficient permissions');
    }
    
    // Handle server errors (5xx)
    if (response?.status >= 500) {
      console.error('Server error:', response.status);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;