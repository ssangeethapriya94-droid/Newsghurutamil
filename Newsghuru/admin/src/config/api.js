import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
});

// Request interceptor to automatically add JWT Bearer token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const fixImageUrls = (data) => {
  if (typeof data === 'string' && (data.startsWith('/uploads/') || data.startsWith('/images/'))) {
    return API.defaults.baseURL + data;
  }
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data.map(item => fixImageUrls(item));
  }
  
  const newData = { ...data };
  for (const key in newData) {
    newData[key] = fixImageUrls(newData[key]);
  }
  return newData;
};

API.interceptors.response.use((response) => {
  if (response.data) {
    response.data = fixImageUrls(response.data);
  }
  return response;
}, (error) => {
  return Promise.reject(error);
});

export default API;