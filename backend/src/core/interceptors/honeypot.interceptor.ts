import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { HONEYPOT_METADATA_KEY, HoneypotOptions } from '../decorators/honeypot.decorator';

@Injectable()
export class HoneypotInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HoneypotInterceptor.name);

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Honeypot validation only checks POST, PUT, PATCH requests
    if (request.method !== 'POST' && request.method !== 'PUT' && request.method !== 'PATCH') {
      return next.handle();
    }

    // Retrieve honeypot options from the route handler metadata
    const options = this.reflector.getAllAndOverride<HoneypotOptions>(
      HONEYPOT_METADATA_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!options) {
      return next.handle();
    }

    const fieldsToCheck = options.fields || ['website'];
    const body = request.body || {};

    let isBot = false;
    let filledField = '';

    // If any honeypot field is present and has value, it's a bot
    for (const field of fieldsToCheck) {
      if (body[field] !== undefined && body[field] !== null && body[field] !== '') {
        isBot = true;
        filledField = field;
        break;
      }
    }

    if (isBot) {
      this.logger.warn(
        `Spam bot detected! Honeypot field "${filledField}" was filled with value: "${body[filledField]}". Request URL: ${request.url}, IP: ${request.ip || 'unknown'}`
      );

      // Return simulated success response
      const fakeResponse = typeof options.fakeResponse === 'function'
        ? options.fakeResponse(request)
        : options.fakeResponse || { success: true };

      // Short-circuit the execution: bypassing the validator pipes and route handler
      return of(fakeResponse);
    }

    return next.handle();
  }
}
