import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;
  private readonly logoUrl: string;

  constructor(config: ConfigService) {
    this.from = config.getOrThrow<string>('MAIL_FROM');
    this.logoUrl = `${config.getOrThrow<string>('WEBSITE_URL')}/logo.png`;
    this.transporter = nodemailer.createTransport({
      host: config.getOrThrow<string>('MAIL_HOST'),
      port: config.getOrThrow<number>('MAIL_PORT'),
      secure: config.getOrThrow<number>('MAIL_PORT') === 465,
      auth: {
        user: config.getOrThrow<string>('MAIL_USER'),
        pass: config.getOrThrow<string>('MAIL_PASSWORD'),
      },
    });
  }

  async sendMagicLinkEmail(email: string, magicLink: string): Promise<void> {
    const html = this.loadTemplate('magic-link.html', {
      magicLink,
      email,
      logoUrl: this.logoUrl,
    });
    await this.send({ to: email, subject: 'Your magic login link', html });
  }

  async sendWelcomeEmail(
    email: string,
    fullName: string | null,
    verificationLink: string,
  ): Promise<void> {
    const name = fullName ?? email;
    const html = this.loadTemplate('welcome.html', {
      name,
      email,
      verificationLink,
      logoUrl: this.logoUrl,
    });
    await this.send({ to: email, subject: 'Welcome to Borda Event!', html });
  }

  async sendPasswordResetEmail(
    email: string,
    resetLink: string,
  ): Promise<void> {
    const html = this.loadTemplate('password-reset.html', {
      resetLink,
      email,
      logoUrl: this.logoUrl,
    });
    await this.send({ to: email, subject: 'Reset your password', html });
  }

  private async send(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    try {
      await this.transporter.sendMail({ from: this.from, ...options });
    } catch (err) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${(err as Error).message}`,
      );
      throw err;
    }
  }

  private loadTemplate(name: string, vars: Record<string, string>): string {
    const templatePath = path.join(
      process.cwd(),
      'src',
      'mail',
      'templates',
      name,
    );
    let html = fs.readFileSync(templatePath, 'utf-8');
    const allVars = { year: String(new Date().getFullYear()), ...vars };
    for (const [key, value] of Object.entries(allVars)) {
      html = html.replaceAll(`{{${key}}}`, value);
    }
    return html;
  }
}
