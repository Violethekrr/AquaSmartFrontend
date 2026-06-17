import api from './api';

export const login = async (email: string, password: string) => {
  
  const res = await api.post('/users/login/', { email, password });
 
  return res.data; // { access_token, refresh_token, user }
};

export const getCurrentUser = async () => {
  const res = await api.get('/users/me/');
  return res.data;
};

export const getUsers = async () => {
  const res = await api.get('/users/');
  return res.data;
};