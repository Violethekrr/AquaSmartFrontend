import api from './api';

// Récupérer tous les lots
export const getSaltBatches = async () => {
  const res = await api.get('/salt/');
  return res.data;
};

// Récupérer les lots non vendus
export const getUnsoldSalt = async () => {
  const res = await api.get('/salt/?sold=false');
  return res.data;
};