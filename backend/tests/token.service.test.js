const { generateToken, hashToken, createEmailToken, validateToken } = require('../src/services/token.service');

// Mock Prisma
jest.mock('../src/config/prisma', () => ({
  emailToken: {
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn()
  }
}));

const prisma = require('../src/config/prisma');

describe('Token Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    test('should generate a token', () => {
      const token = generateToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    test('should generate unique tokens', () => {
      const token1 = generateToken();
      const token2 = generateToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('hashToken', () => {
    test('should hash a token consistently', () => {
      const token = 'test-token';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);
      expect(hash1).toBe(hash2);
    });

    test('should produce different hashes for different tokens', () => {
      const hash1 = hashToken('token1');
      const hash2 = hashToken('token2');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('createEmailToken', () => {
    test('should create email token with correct expiry', async () => {
      const mockCreate = jest.fn().mockResolvedValue({});
      prisma.emailToken.create = mockCreate;

      const token = await createEmailToken(prisma, 1, 'VERIFY', 24);

      expect(token).toBeDefined();
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 1,
          type: 'VERIFY',
          tokenHash: expect.any(String),
          expiresAt: expect.any(Date)
        })
      });
    });
  });

  describe('validateToken', () => {
    test('should validate valid token', async () => {
      const token = 'valid-token';
      const mockEmailToken = {
        id: 1,
        userId: 1,
        tokenHash: hashToken(token),
        type: 'VERIFY',
        used: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        user: { id: 1, email: 'test@example.com' }
      };

      prisma.emailToken.findFirst.mockResolvedValue(mockEmailToken);

      const result = await validateToken(prisma, token, 'VERIFY');
      expect(result).toEqual(mockEmailToken);
    });

    test('should reject expired token', async () => {
      const token = 'expired-token';
      prisma.emailToken.findFirst.mockResolvedValue(null);

      const result = await validateToken(prisma, token, 'VERIFY');
      expect(result).toBeNull();
    });

    test('should reject used token', async () => {
      const token = 'used-token';
      prisma.emailToken.findFirst.mockResolvedValue(null);

      const result = await validateToken(prisma, token, 'VERIFY');
      expect(result).toBeNull();
    });
  });
});