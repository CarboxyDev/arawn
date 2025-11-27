import { render } from '@react-email/components';
import PasswordResetEmail from 'emails/password-reset-email';
import VerificationEmail from 'emails/verification-email';
import { Resend } from 'resend';

import type { LoggerService } from '@/common/logger.service';
import type { Env } from '@/config/env';
import type { PrismaClient } from '@/generated/client/client.js';

export class EmailService {
  private resend: Resend | null = null;
  private isConfigured: boolean;
  private emailFrom: string;

  constructor(
    private readonly env: Env,
    private readonly logger: LoggerService,
    private readonly prisma: PrismaClient
  ) {
    this.logger.setContext('EmailService');

    this.isConfigured = !!(this.env.RESEND_API_KEY && this.env.EMAIL_FROM);
    this.emailFrom = this.env.EMAIL_FROM || 'noreply@example.com';

    if (this.isConfigured) {
      this.resend = new Resend(this.env.RESEND_API_KEY!);
      this.logger.info(
        `[+] Email service initialized with Resend. Email: ${this.emailFrom}`
      );
    } else {
      this.logger.warn(
        'Email service not configured (missing RESEND_API_KEY or EMAIL_FROM) - emails will be logged to console'
      );
    }
  }

  async sendVerificationEmail(
    email: string,
    verificationUrl: string
  ): Promise<{ success: boolean; error?: string }> {
    const subject = 'Verify your email address';

    try {
      const html = await render(
        VerificationEmail({
          verificationUrl,
          userEmail: email,
        })
      );

      await this.sendEmail({
        to: email,
        subject,
        html,
      });

      this.logger.info('Verification email sent', { to: email });
      return { success: true };
    } catch (error) {
      this.logger.error(
        'Failed to send verification email - user can resend later',
        error instanceof Error ? error : new Error(String(error)),
        { to: email }
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetUrl: string
  ): Promise<{ success: boolean; error?: string }> {
    const subject = 'Reset your password';

    try {
      const html = await render(
        PasswordResetEmail({
          resetUrl,
          userEmail: email,
        })
      );

      await this.sendEmail({
        to: email,
        subject,
        html,
      });

      this.logger.info('Password reset email sent', { to: email });
      return { success: true };
    } catch (error) {
      this.logger.error(
        'Failed to send password reset email',
        error instanceof Error ? error : new Error(String(error)),
        { to: email }
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async sendEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    if (!this.isConfigured) {
      this.logger
        .detailed()
        .info('Email not sent (dev mode - no API key configured)', {
          to,
          subject,
        });

      console.log(
        '\n┌─────────────────────────────────────────────────────────┐'
      );
      console.log(
        '│                   📧 EMAIL PREVIEW                      │'
      );
      console.log(
        '└─────────────────────────────────────────────────────────┘'
      );
      console.log(`To:      ${to}`);
      console.log(`From:    ${this.emailFrom}`);
      console.log(`Subject: ${subject}`);
      console.log('─────────────────────────────────────────────────────────');
      console.log(`Preview: ${html.slice(0, 300)}...`);
      console.log(
        '─────────────────────────────────────────────────────────\n'
      );

      return;
    }

    try {
      const result = await this.resend!.emails.send({
        from: this.emailFrom,
        to,
        subject,
        html,
      });

      this.logger.detailed().debug('Email sent successfully', {
        to,
        subject,
        emailId: result.data?.id,
      });
    } catch (error) {
      this.logger.error(
        'Failed to send email via Resend',
        error instanceof Error ? error : new Error(String(error)),
        {
          to,
          subject,
        }
      );
      throw error;
    }
  }
}
