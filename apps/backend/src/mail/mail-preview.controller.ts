import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const LOGO_URL = 'http://localhost:3000/images/logo.png';

const SAMPLE_VARS: Record<string, Record<string, string>> = {
  'welcome.html': {
    name: 'Jane Smith',
    email: 'jane@example.com',
    verificationLink: '#',
    logoUrl: LOGO_URL,
  },
  'magic-link.html': {
    email: 'jane@example.com',
    magicLink: '#',
    logoUrl: LOGO_URL,
  },
  'password-reset.html': {
    email: 'jane@example.com',
    resetLink: '#',
    logoUrl: LOGO_URL,
  },
};

@Controller('dev/mail-preview')
export class MailPreviewController {
  @Get()
  index() {
    if (process.env['NODE_ENV'] === 'production') {
      throw new NotFoundException();
    }

    const templates = Object.keys(SAMPLE_VARS);
    const links = templates
      .map((t) => `<li><a href="/api/dev/mail-preview/${t}">${t}</a></li>`)
      .join('');

    return `<!doctype html><html><head><meta charset="UTF-8"><title>Mail Preview</title>
      <style>body{font-family:sans-serif;padding:40px}li{margin:8px 0}a{color:#1d293d}</style>
      </head><body><h2>Mail Templates</h2><ul>${links}</ul></body></html>`;
  }

  @Get(':template')
  preview(@Param('template') template: string, @Res() res: Response) {
    if (process.env['NODE_ENV'] === 'production') {
      throw new NotFoundException();
    }

    const vars = SAMPLE_VARS[template];
    if (!vars) throw new NotFoundException(`Template "${template}" not found`);

    const templatePath = path.join(
      process.cwd(),
      'src',
      'mail',
      'templates',
      template,
    );

    if (!fs.existsSync(templatePath)) {
      throw new NotFoundException(`Template file not found`);
    }

    let html = fs.readFileSync(templatePath, 'utf-8');
    for (const [key, value] of Object.entries(vars)) {
      html = html.replaceAll(`{{${key}}}`, value);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
}
