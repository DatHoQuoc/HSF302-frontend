import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;


    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; 

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
         
          const response = await axios.post('/api/refresh-token', { refreshToken });
          const newAccessToken = response.data.accessToken;
          localStorage.setItem('authToken', newAccessToken);

         
          api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`; 
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`; 
          return api(originalRequest); 
        } catch (refreshError) {
   
          console.error('Không thể refresh token:', refreshError);
      
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login'; 
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

   
    if (error.response) {
      console.error(`Lỗi API: ${error.response.status}`, error.response.data);
    } else if (error.request) {
 
      console.error('Không có phản hồi từ máy chủ:', error.request);
    } else {
      console.error('Lỗi khi thiết lập yêu cầu:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;