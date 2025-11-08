const crypto = require('crypto');
const bcrypt = require('bcrypt');

const generateToken = () => {
  return crypto.randomBytes(32).toString('base64url');
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const createEmailToken = async (prisma, userId, type, expiryHours = 24) => {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

  await prisma.emailToken.create({
    data: {
      userId,
      tokenHash,
      type,
      expiresAt
    }
  });

  return token;
};

const validateToken = async (prisma, token, type) => {
  const tokenHash = hashToken(token);
  
  const emailToken = await prisma.emailToken.findFirst({
    where: {
      tokenHash,
      type,
      used: false,
      expiresAt: { gt: new Date() }
    },
    include: { user: true }
  });

  return emailToken;
};

const markTokenUsed = async (prisma, tokenId) => {
  await prisma.emailToken.update({
    where: { id: tokenId },
    data: { used: true }
  });
};

module.exports = {
  generateToken,
  hashToken,
  createEmailToken,
  validateToken,
  markTokenUsed
};