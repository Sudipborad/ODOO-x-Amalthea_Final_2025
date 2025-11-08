const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

const getWorkingDaysBetween = (startDate, endDate) => {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    if (!isWeekend(current)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
};

const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

const isDateInRange = (date, startDate, endDate) => {
  const checkDate = new Date(date);
  return checkDate >= new Date(startDate) && checkDate <= new Date(endDate);
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

module.exports = {
  isWeekend,
  getWorkingDaysBetween,
  formatDate,
  isDateInRange,
  addDays
};  