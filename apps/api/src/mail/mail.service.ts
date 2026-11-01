import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

interface InvitationEmail {
  recipient: string;
  workspaceName: string;
  role: string;
}

interface VerificationEmail {
  recipient: string;
  otp: string;
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[character] ?? character,
  );
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  async sendWorkspaceInvitation({
    recipient,
    workspaceName,
    role,
  }: InvitationEmail): Promise<boolean> {
    if (!this.resend) {
      this.logger.warn(
        `Invitation created for ${recipient}, but email delivery is not configured.`,
      );
      return false;
    }

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const from =
      process.env.RESEND_FROM_EMAIL ?? 'Vynor <no-reply@vynor.in>';
    const invitationUrl = `${frontendUrl}/dashboard`;
    const safeWorkspaceName = escapeHtml(workspaceName);
    const safeRole = escapeHtml(role.toLowerCase());

    try {
      const { error } = await this.resend.emails.send({
        from,
        to: recipient,
        subject: `You're invited to join ${workspaceName} on Vynor`,
        text: [
          `You've been invited to join ${workspaceName} on Vynor.`,
          `Your role: ${role.toLowerCase()}.`,
          '',
          `Sign in to accept the invitation: ${invitationUrl}`,
        ].join('\n'),
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; color: #14141c;">
            <h1 style="font-size: 24px; margin-bottom: 12px;">You're invited to Vynor</h1>
            <p>You've been invited to join <strong>${safeWorkspaceName}</strong>.</p>
            <p>Your role: <strong>${safeRole}</strong></p>
            <a href="${invitationUrl}" style="display: inline-block; margin-top: 16px; padding: 12px 18px; border-radius: 10px; background: #14141c; color: #ffffff; text-decoration: none;">
              View invitation
            </a>
          </div>
        `,
      });

      if (!error) {
        this.logger.log(`Invitation email sent to ${recipient}.`);
        return true;
      }

      this.logger.error(
        `Invitation created for ${recipient}, but email delivery failed: ${error.message}`,
      );
      return false;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Invitation created for ${recipient}, but email delivery failed: ${message}`,
      );
      return false;
    }
  }

  async sendRegistrationVerificationOtp({
    recipient,
    otp,
  }: VerificationEmail): Promise<boolean> {
    if (!this.resend) {
      this.logger.warn('Registration verification email delivery is not configured.');
      return false;
    }

    const from =
      process.env.RESEND_FROM_EMAIL ?? 'Vynor <no-reply@vynor.in>';

    try {
      const { error } = await this.resend.emails.send({
        from,
        to: recipient,
        subject: 'Your Vynor verification code',
        text: `Your Vynor verification code is ${otp}. It expires in 5 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; color: #14141c;">
            <h1 style="font-size: 24px; margin-bottom: 12px;">Verify your Vynor account</h1>
            <p>Enter this code to finish creating your account:</p>
            <p style="font-size: 32px; font-weight: 700; letter-spacing: 8px;">${otp}</p>
            <p>This code expires in 5 minutes.</p>
          </div>
        `,
      });

      if (error) {
        this.logger.error(
          `Registration verification email delivery failed: ${error.message}`,
        );
        return false;
      }

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Registration verification email delivery failed: ${message}`,
      );
      return false;
    }
  }
}
