import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

import { createChildLogger } from '@cartrader/logger';

import { NotificationsEnv } from '../../../../config/environment';

export interface SendEmailOptions {
  to: string;
  subject?: string | null;
  html?: string | null;
  text?: string | null;
}

@Injectable()
export class EmailProvider {
  private readonly logger = createChildLogger({ context: EmailProvider.name });
  private readonly transporter: Transporter;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService<NotificationsEnv>) {
    const host = this.getString('SMTP_HOST');
    const port = this.getNumber('SMTP_PORT');
    const user = this.getString('SMTP_USER');
    const pass = this.getString('SMTP_PASSWORD');
    this.fromAddress = this.getString('EMAIL_FROM_ADDRESS');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    }) as Transporter;
  }

  async send(options: SendEmailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: this.fromAddress,
      to: options.to,
      subject: options.subject ?? undefined,
      html: options.html ?? undefined,
      text: options.text ?? undefined,
    });

    this.logger.info({ to: options.to }, 'Email dispatched');
  }

  private getString(key: string): string {
    const value = this.configService.get<string | undefined>(key, { infer: true });
    if (typeof value !== 'string') {
      throw new Error(`Missing required configuration value: ${key}`);
    }

    if (value === '') {
      throw new Error(`Missing required configuration value: ${key}`);
    }

    return value;
  }

  private getNumber(key: string): number {
    const value = this.configService.get<number | undefined>(key, { infer: true });
    if (typeof value !== 'number') {
      throw new Error(`Missing required numeric configuration value: ${key}`);
    }

    return value;
  }
}
