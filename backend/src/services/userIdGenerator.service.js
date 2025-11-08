const prisma = require('../config/prisma');

const generateUserId = async (firstName, lastName, companyCode = 'OI') => {
  const year = new Date().getFullYear();
  
  // Extract first two letters of first and last name
  const firstNameCode = firstName.substring(0, 2).toUpperCase();
  const lastNameCode = lastName.substring(0, 2).toUpperCase();
  
  // Find the next serial number for this year
  const existingUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`)
      }
    }
  });
  
  const serialNumber = String(existingUsers + 1).padStart(4, '0');
  
  return `${companyCode}${firstNameCode}${lastNameCode}${year}${serialNumber}`;
};

module.exports = { generateUserId };