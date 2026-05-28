import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RevalidationService {
  private readonly logger = new Logger(RevalidationService.name);

  constructor(private readonly config: ConfigService) {}

  revalidate(tags: string[]): void {
    // fire-and-forget — do not await
    const url = this.config.get<string>('WEBSITE_REVALIDATE_URL');
    const secret = this.config.get<string>('WEBSITE_REVALIDATE_SECRET');

    if (!url || !secret) return;

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, tags }),
    }).catch((err: unknown) =>
      this.logger.warn(
        `Revalidation failed: ${err instanceof Error ? err.message : String(err)}`,
      ),
    );
  }
}
