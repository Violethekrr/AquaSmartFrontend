import api from './api';

// Récupérer tous les rapports
export const getProductionReports = async () => {
  const res = await api.get('/production/');
  return res.data;
};

// Récupérer le rapport du jour
export const getTodayProduction = async () => {
  const today = new Date().toISOString().split('T')[0];
  const res = await api.get(`/production/?report_date=${today}`);
  return res.data;
};

// Récupérer les 7 derniers jours
export const getLastWeekProduction = async () => {
  const res = await api.get('/production/?ordering=-report_date&limit=7');
  return res.data;
};