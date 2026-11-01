import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';

describe('AuthService registration verification', () => {
  const challenge = {
    id: 'challenge-1',
    email: 'new@example.com',
    name: 'New User',
    passwordHash: 'password-hash',
    otpHash: '',
    attempts: 0,
    expiresAt: new Date(Date.now() + 300_000),
    lastSentAt: new Date(Date.now() - 61_000),
  };

  function createService() {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: 'user-1',
          name: challenge.name,
          email: challenge.email,
          tokenVersion: 0,
        }),
      },
      registrationVerification: {
        upsert: jest.fn().mockImplementation(({ create, update }) => ({
          ...create,
          ...update,
          id: challenge.id,
        })),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn(async (callback) => callback(prisma)),
    };
    const mailService = {
      sendRegistrationVerificationOtp: jest.fn().mockResolvedValue(true),
    };
    const service = new AuthService(
      prisma as never,
      {} as never,
      {} as never,
      mailService as never,
    );

    return { prisma, mailService, service };
  }

  it('creates a pending challenge and sends a code without creating a user', async () => {
    const { prisma, mailService, service } = createService();

    const response = await service.register({
      name: challenge.name,
      email: 'NEW@EXAMPLE.COM',
      password: 'password123',
    });

    expect(response.email).toBe(challenge.email);
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(mailService.sendRegistrationVerificationOtp).toHaveBeenCalledWith(
      expect.objectContaining({ recipient: challenge.email }),
    );
  });

  it('counts an incorrect code attempt', async () => {
    const { prisma, service } = createService();
    challenge.otpHash = await bcrypt.hash('123456', 4);
    prisma.registrationVerification.findUnique.mockResolvedValue(challenge);

    await expect(
      service.verifyRegistration({ email: challenge.email, otp: '000000' }),
    ).rejects.toThrow('incorrect');

    expect(prisma.registrationVerification.update).toHaveBeenCalledWith({
      where: { id: challenge.id },
      data: { attempts: 1 },
    });
  });

  it('creates and then invalidates the account challenge for a valid code', async () => {
    const { prisma, service } = createService();
    challenge.otpHash = await bcrypt.hash('123456', 4);
    prisma.registrationVerification.findUnique.mockResolvedValue(challenge);

    await expect(
      service.verifyRegistration({ email: challenge.email, otp: '123456' }),
    ).resolves.toEqual({
      message: 'Email verified. Your account is ready—please sign in.',
    });

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: challenge.name,
        email: challenge.email,
        passwordHash: challenge.passwordHash,
        emailVerified: true,
      },
    });
    expect(prisma.registrationVerification.delete).toHaveBeenCalledWith({
      where: { id: challenge.id },
    });
  });
});
