export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleString('fr-FR');
};

export const formatNumber = (num: number, decimals: number = 2) => {
  return num.toFixed(decimals);
};