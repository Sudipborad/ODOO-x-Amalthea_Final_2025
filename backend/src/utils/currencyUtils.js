const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

const roundToTwoDecimals = (amount) => {
  return Math.round(amount * 100) / 100;
};

const calculatePercentage = (amount, percentage) => {
  return roundToTwoDecimals((amount * percentage) / 100);
};

module.exports = {
  formatCurrency,
  roundToTwoDecimals,
  calculatePercentage
};