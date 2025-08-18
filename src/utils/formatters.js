export const formatDate = (date) => {
  // Format date to string, e.g. "YYYY-MM-DD"
  return date.toISOString().split('T')[0];
};
