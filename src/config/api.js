// Configuration de l'API
const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000';

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export default apiConfig;











