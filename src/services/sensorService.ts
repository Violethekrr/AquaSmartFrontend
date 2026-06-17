import api from './api';

// Récupérer toutes les données des capteurs
export const getSensors = async () => {
  const res = await api.get('/sensors/');
  return res.data;
};

// Récupérer les données d'un type spécifique (ex: salinity)
export const getSensorsByType = async (type: string) => {
  const res = await api.get(`/sensors/?sensor_type=${type}`);
  return res.data;
};

// Récupérer les dernières données de chaque capteur
export const getLatestSensors = async () => {
  const res = await api.get('/sensors/?ordering=-timestamp&limit=1');
  return res.data;
};

// Récupérer l'historique d'un capteur (7 derniers jours)
export const getSensorHistory = async (type: string, days: number = 7) => {
  const from = new Date(Date.now() - days * 86400000).toISOString();
  const res = await api.get(`/sensors/history?type=${type}&from_date=${from}`);
  return res.data;
};