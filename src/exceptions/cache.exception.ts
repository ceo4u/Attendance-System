import { HttpException, HttpStatus } from '@nestjs/common';

export class CacheException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    super({
      message,
      error: 'Cache Error',
      statusCode: status,
    }, status);
  }
}

export class CacheConnectionException extends CacheException {
  constructor(message: string = 'Failed to connect to cache server') {
    super(message, HttpStatus.SERVICE_UNAVAILABLE);
  }
}

export class CacheReadException extends CacheException {
  constructor(key: string, error?: string) {
    super(`Failed to read from cache for key: ${key}${error ? ` (${error})` : ''}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class CacheWriteException extends CacheException {
  constructor(key: string, error?: string) {
    super(`Failed to write to cache for key: ${key}${error ? ` (${error})` : ''}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class CacheInvalidationException extends CacheException {
  constructor(key: string, error?: string) {
    super(`Failed to invalidate cache for key: ${key}${error ? ` (${error})` : ''}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
