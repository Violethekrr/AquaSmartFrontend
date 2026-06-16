import api from './api';

export const getAlarms = async () => {
  const res = await api.get('/alarms');
  return res.data;
};

export const acknowledgeAlarm = async (id: number) => {
  await api.put(`/alarms/${id}/acknowledge`);
};