import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Para cuando despliegues
  : 'http://localhost:5000/api';  // Backend ahora en 5000 + /api (tus rutas usan /api/...)

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,  // Aumentado a 10s para evitar timeouts prematuros en requests lentos
});

let isRefreshing = false;  // Flag para evitar múltiples refreshes simultáneos
let failedQueue = [];  // Cola de requests fallidos para retry después de refresh

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Función helper para decidir token (user o admin) - FIX: Agrega /auth/categories como admin
const getAuthToken = (url) => {
  const adminRoutes = ['/admin/', '/auth/categories', '/auth/admin/'];  // FIX mínimo: incluye /auth/categories
  const isAdminRoute = url && adminRoutes.some(route => url.startsWith(route));
  return isAdminRoute 
    ? localStorage.getItem('adminToken') 
    : localStorage.getItem('token');
};

// Request interceptor: agrega token si existe (user o admin según ruta)
api.interceptors.request.use(config => {
  const token = getAuthToken(config.url);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('API Request con token:', config.method?.toUpperCase(), config.url, 'Token type:', getAuthToken(config.url) ? (config.url?.startsWith('/admin/') || config.url?.startsWith('/auth/categories') ? 'admin' : 'user') : 'none');  // Debug mejorado con fix
  } else {
    console.log('API Request sin token:', config.method?.toUpperCase(), config.url);  // Debug
  }
  return config;
});

// Response interceptor: maneja éxito/errores
api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    console.error('API Error:', error.response?.status, error.message);  // Debug: errores detallados

    // Si es 401 y no es un refresh request, intenta refrescar token
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing) {
      const isAdmin = originalRequest.url?.startsWith('/admin/') || originalRequest.url?.includes('/auth/categories');
      const tokenKey = isAdmin ? 'adminToken' : 'token';
      const refreshKey = isAdmin ? 'adminRefreshToken' : 'refreshToken';  // Asume refreshToken separado para admin

      if (isRefreshing) {
        // Si ya hay un refresh en curso, espera y retry
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;  // Marca para no retry infinito
      isRefreshing = true;

      try {
        // Asume que tienes un refreshToken en localStorage y endpoint /auth/refresh (o /auth/admin/refresh)
        const refreshToken = localStorage.getItem(refreshKey);
        if (!refreshToken) {
          throw new Error(`No ${isAdmin ? 'admin' : ''} refresh token available`);
        }

        const refreshEndpoint = isAdmin ? `${API_URL}/auth/admin/refresh` : `${API_URL}/auth/refresh`;
        console.log('Intentando refresh en:', refreshEndpoint);  // FIX: Debug para ver si llama al endpoint
        const response = await axios.post(refreshEndpoint, { 
          refreshToken 
        });  // Usa axios directo para evitar loop en interceptor

        if (response.data.success && response.data.token) {
          const newToken = response.data.token;
          localStorage.setItem(tokenKey, newToken);
          // Opcional: refresca también el refreshToken si lo envía
          if (response.data.refreshToken) {
            localStorage.setItem(refreshKey, response.data.refreshToken);
          }

          // Procesa la cola de requests pendientes
          processQueue(null, newToken);

          // Retry el request original con nuevo token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          throw new Error('Refresh failed: invalid response');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);  // Ya lo tenías, pero ahora con más contexto
        processQueue(refreshError, null);

        // Limpia tokens y redirige a login
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(refreshKey);
        const loginPath = isAdmin ? '/admin/login' : '/user_login';
        window.location.href = loginPath;  // O usa navigate de react-router si lo tienes
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Para otros errores (e.g., 500), solo rechaza
    return Promise.reject(error);
  }
);

export default api;