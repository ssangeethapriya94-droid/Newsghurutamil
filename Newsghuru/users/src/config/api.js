import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
});

const fixImageUrls = (data) => {
  if (typeof data === 'string' && data.startsWith('/uploads/')) {
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