import api from './api';

// Récupérer toutes les commandes
export const getOrders = async () => {
  const res = await api.get('/orders/');
  return res.data;
};

// Récupérer les commandes en attente
export const getPendingOrders = async () => {
  const res = await api.get('/orders/?status=pending');
  return res.data;
};