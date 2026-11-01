import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Prisma } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { randomInt } from "node:crypto";

import { PrismaService } from "../../../database/prisma.service";
import { LoginDto } from "../dto/login.dto";
import { RegisterDto } from "../dto/register.dto";
import { VerifyRegistrationDto } from "../dto/verify-registration.dto";
import { ResendRegistrationDto } from "../dto/resend-registration.dto";
import { AuthSessionRegistry } from "./auth-session-registry.service";
import { MailService } from "../../../mail/mail.service";

const verificationLifetimeMs = 5 * 60 * 1000;
const resendCooldownMs = 60 * 1000;
const maxVerificationAttempts = 5;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createOtp() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly authSessionRegistry: AuthSessionRegistry,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const { name, password } = dto;
    const email = normalizeEmail(dto.email);

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new BadRequestException("Email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const otp = createOtp();
    const now = new Date();
    const challenge = await this.prisma.registrationVerification.upsert({
      where: { email },
      create: {
        name,
        email,
        passwordHash,
        otpHash: await bcrypt.hash(otp, 10),
        expiresAt: new Date(now.getTime() + verificationLifetimeMs),
        lastSentAt: now,
      },
      update: {
        name,
        passwordHash,
        otpHash: await bcrypt.hash(otp, 10),
        attempts: 0,
        expiresAt: new Date(now.getTime() + verificationLifetimeMs),
        lastSentAt: now,
      },
    });

    const sent = await this.mailService.sendRegistrationVerificationOtp({
      recipient: email,
      otp,
    });

    if (!sent) {
      await this.prisma.registrationVerification.delete({
        where: { id: challenge.id },
      });
      throw new BadRequestException(
        "We couldn't send a verification email. Please try again later.",
      );
    }

    return {
      message: "Verification code sent. Check your email to finish signing up.",
      email,
    };
  }

  async verifyRegistration(dto: VerifyRegistrationDto) {
    const email = normalizeEmail(dto.email);
    const now = new Date();

    await this.prisma.$transaction(
      async (tx) => {
        const challenge = await tx.registrationVerification.findUnique({
          where: { email },
        });

        if (!challenge || challenge.expiresAt <= now) {
          if (challenge) {
            await tx.registrationVerification.delete({
              where: { id: challenge.id },
            });
          }
          throw new BadRequestException("This verification code is invalid or expired.");
        }

        const valid = await bcrypt.compare(dto.otp, challenge.otpHash);
        if (!valid) {
          const attempts = challenge.attempts + 1;
          if (attempts >= maxVerificationAttempts) {
            await tx.registrationVerification.delete({
              where: { id: challenge.id },
            });
            throw new BadRequestException(
              "Too many incorrect attempts. Please request a new code.",
            );
          }

          await tx.registrationVerification.update({
            where: { id: challenge.id },
            data: { attempts },
          });
          throw new BadRequestException("That verification code is incorrect.");
        }

        const existingUser = await tx.user.findUnique({ where: { email } });
        if (existingUser) {
          await tx.registrationVerification.delete({
            where: { id: challenge.id },
          });
          throw new BadRequestException("Email already exists");
        }

        await tx.user.create({
          data: {
            name: challenge.name,
            email: challenge.email,
            passwordHash: challenge.passwordHash,
            emailVerified: true,
          },
        });
        await tx.registrationVerification.delete({
          where: { id: challenge.id },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return {
      message: "Email verified. Your account is ready—please sign in.",
    };
  }

  async resendRegistration(dto: ResendRegistrationDto) {
    const email = normalizeEmail(dto.email);
    const genericResponse = {
      message: "If this registration can receive a new code, it will be sent shortly.",
    };
    const challenge = await this.prisma.registrationVerification.findUnique({
      where: { email },
    });

    if (!challenge) {
      return genericResponse;
    }

    const now = new Date();
    if (now.getTime() - challenge.lastSentAt.getTime() < resendCooldownMs) {
      return genericResponse;
    }

    const otp = createOtp();
    await this.prisma.registrationVerification.update({
      where: { id: challenge.id },
      data: {
        otpHash: await bcrypt.hash(otp, 10),
        attempts: 0,
        expiresAt: new Date(now.getTime() + verificationLifetimeMs),
        lastSentAt: now,
      },
    });

    const sent = await this.mailService.sendRegistrationVerificationOtp({
      recipient: email,
      otp,
    });

    if (!sent) {
      throw new BadRequestException(
        "We couldn't send a verification email. Please try again later.",
      );
    }

    return genericResponse;
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = await this.createToken(user.id, user.email, user.tokenVersion);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async googleLogin(profile: {
    providerId: string;
    email?: string;
    name: string;
    avatar?: string;
  }) {
    return this.oauthLogin('GOOGLE', profile);
  }

  async githubLogin(profile: {
    providerId: string;
    email?: string;
    name: string;
    avatar?: string;
  }) {
    return this.oauthLogin('GITHUB', profile);
  }

  async revokeToken(token?: string) {
    if (!token) {
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
      }>(token);

      await this.prisma.user.update({
        where: { id: payload.sub },
        data: {
          tokenVersion: {
            increment: 1,
          },
        },
      });

      this.authSessionRegistry.disconnectUser(payload.sub);
    } catch {
      // Logout still clears the client cookie when the submitted token is invalid.
    }
  }

  private async oauthLogin(
    provider: 'GOOGLE' | 'GITHUB',
    profile: {
      providerId: string;
      email?: string;
      name: string;
      avatar?: string;
    },
  ) {
    let user = await this.prisma.user.findFirst({
      where: {
        provider,
        providerId: profile.providerId,
      },
    });

    if (!user && profile.email) {
      const emailUser = await this.prisma.user.findUnique({
        where: { email: profile.email },
      });

      if (emailUser) {
        throw new UnauthorizedException(
          'This email is already associated with another account',
        );
      }
    }

    if (!user) {
      if (!profile.email) {
        throw new UnauthorizedException(
          `${provider} account does not provide an email`,
        );
      }

      user = await this.prisma.user.create({
        data: {
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar,
          provider,
          providerId: profile.providerId,
          emailVerified: true,
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          avatar: profile.avatar,
        },
      });
    }

    const token = await this.createToken(
      user.id,
      user.email,
      user.tokenVersion,
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  private createToken(userId: string, email: string, tokenVersion: number) {
    return this.jwtService.signAsync({
      sub: userId,
      email,
      tokenVersion,
    });
  }
}