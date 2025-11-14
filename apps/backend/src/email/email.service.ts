import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // Initialize SMTP transporter using self-hosted Postfix
    const smtpHost = process.env.SMTP_HOST || 'postfix';
    const smtpPort = parseInt(process.env.SMTP_PORT || '25', 10);
    const smtpFrom = process.env.SMTP_FROM || 'noreply@cartrader.local';

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false, // Postfix on port 25 doesn't use TLS by default
      // No authentication needed for local Postfix
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });

    this.logger.log(`📧 Email service initialized: ${smtpHost}:${smtpPort} (self-hosted Postfix)`);
  }

  /**
   * Send email verification email
   * In production, replace this with actual email service (SendGrid, SES, etc.)
   */
  async sendVerificationEmail(
    email: string,
    name: string | null,
    verificationToken: string,
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationUrl = `${frontendUrl}/auth/verify-email?token=${verificationToken}`;
    const fromEmail = process.env.SMTP_FROM || 'noreply@cartrader.local';

    try {
      await this.transporter.sendMail({
        from: fromEmail,
        to: email,
        subject: 'Verify your email address - CarTrader',
        html: this.getVerificationEmailTemplate(name, verificationUrl),
      });

      this.logger.log(`✅ Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}:`, error);
      // Don't throw - log error but don't break registration
      // In production, you might want to queue for retry
    }
  }

  /**
   * Get verification email HTML template
   */
  private getVerificationEmailTemplate(name: string | null, verificationUrl: string): string {
    const displayName = name || 'there';
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">Verify Your Email Address</h1>
            <p>Hi ${displayName},</p>
            <p>Thank you for signing up for CarTrader! Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              © ${new Date().getFullYear()} CarTrader. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Send password reset email
   * In production, replace this with actual email service (SendGrid, SES, etc.)
   */
  async sendPasswordResetEmail(
    email: string,
    name: string | null,
    resetToken: string,
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}`;
    const fromEmail = process.env.SMTP_FROM || 'noreply@cartrader.local';

    try {
      await this.transporter.sendMail({
        from: fromEmail,
        to: email,
        subject: 'Reset your password - CarTrader',
        html: this.getPasswordResetEmailTemplate(name, resetUrl),
      });

      this.logger.log(`✅ Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      // Don't throw - log error but don't break the flow
      // In production, you might want to queue for retry
    }
  }

  /**
   * Get password reset email HTML template
   */
  private getPasswordResetEmailTemplate(name: string | null, resetUrl: string): string {
    const displayName = name || 'there';
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">Reset Your Password</h1>
            <p>Hi ${displayName},</p>
            <p>We received a request to reset your password for your CarTrader account. Click the button below to reset it:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p><strong>If you didn't request a password reset, please ignore this email.</strong> Your password will remain unchanged.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              © ${new Date().getFullYear()} CarTrader. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `;
  }
}

