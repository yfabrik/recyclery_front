import axios from 'axios';

const API_BASE_URL =""// import.meta.env.REACT_APP_API_URL || 'http://localhost:5000';

// Configuration axios avec token d'authentification
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/dashboard`,
  timeout: 10000,
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Service pour récupérer les statistiques du dashboard
export const dashboardService = {
  // Récupérer les statistiques principales
  getStats: async () => {
    try {
      const response = await api.get('/stats');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur de connexion'
      };
    }
  },

  // Récupérer les activités récentes
  getActivities: async () => {
    try {
      const response = await api.get('/activities');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des activités:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur de connexion'
      };
    }
  },

  // Récupérer les données pour les graphiques
  getChartsData: async () => {
    try {
      const response = await api.get('/charts');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données de graphiques:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur de connexion'
      };
    }
  },

  // Récupérer toutes les données du dashboard
  getAllDashboardData: async () => {
    try {
      const [statsResponse, activitiesResponse, chartsResponse] = await Promise.all([
        api.get('/stats'),
        api.get('/activities'),
        api.get('/charts')
      ]);

      console.warn(statsResponse,activitiesResponse,chartsResponse)
      return {
        success: true,
        data: {
          stats: statsResponse.data.data,
          activities: activitiesResponse.data.data,
          charts: chartsResponse.data.data
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données du dashboard:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur de connexion'
      };
    }
  }
};

export default dashboardService;











