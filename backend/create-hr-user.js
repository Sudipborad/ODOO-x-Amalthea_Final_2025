const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createHRUser() {
  try {
    const hashedPassword = await bcrypt.hash('hr123456', 12);
    
    const user = await prisma.user.create({
      data: {
        name: 'HR Manager',
        email: 'hr@company.com',
        password: hashedPassword,
        role: 'HR',
        isVerified: true
      }
    });

    console.log('HR user created successfully:');
    console.log('Email: hr@company.com');
    console.log('Password: hr123456');
    console.log('Role: HR');
    
  } catch (error) {
    console.error('Error creating HR user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createHRUser();