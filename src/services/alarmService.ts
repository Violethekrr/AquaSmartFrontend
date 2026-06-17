import api from './api';

// Récupérer toutes les alarmes
export const getAlarms = async () => {
  const res = await api.get('/alarms/');
  return res.data;
};

// Récupérer les alarmes non acquittées
export const getUnacknowledgedAlarms = async () => {
  const res = await api.get('/alarms/?acknowledged=false');
  return res.data;
};

// Récupérer les alarmes critiques
export const getCriticalAlarms = async () => {
  const res = await api.get('/alarms/?severity=critical');
  return res.data;
};

// Acquitter une alarme
export const acknowledgeAlarm = async (id: number) => {
  const res = await api.put(`/alarms/${id}/`, { acknowledged: true });
  return res.data;
};