import { SetMetadata, UseInterceptors, applyDecorators } from '@nestjs/common';
import { HoneypotInterceptor } from '../interceptors/honeypot.interceptor';

export const HONEYPOT_METADATA_KEY = 'honeypot_options';

export interface HoneypotOptions {
  fields?: string[];
  fakeResponse?: any | ((req: any) => any);
}

/**
 * Decorator to enable honeypot spam protection on HTTP routes.
 * It registers the HoneypotInterceptor and applies metadata about the fields to check.
 */
export function CheckHoneypot(options: HoneypotOptions = {}) {
  return applyDecorators(
    SetMetadata(HONEYPOT_METADATA_KEY, options),
    UseInterceptors(HoneypotInterceptor),
  );
}
