import api from './api';

// Récupérer toutes les notifications
export const getNotifications = async () => {
  const res = await api.get('/notifications/');
  return res.data;
};

// Récupérer les notifications non lues
export const getUnreadNotifications = async () => {
  const res = await api.get('/notifications/?read=false');
  return res.data;
};

// Marquer une notification comme lue
export const markNotificationRead = async (id: number) => {
  const res = await api.post(`/notifications/${id}/mark_read/`);
  return res.data;
};