import { Injectable, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ConfigService {
  private readonly envConfig: { [key: string]: string };
  private readonly logger = new Logger(ConfigService.name);

  constructor() {
    // Try to load .env file if it exists
    const envFile = path.resolve(process.cwd(), '.env');
    this.envConfig = {};

    try {
      if (fs.existsSync(envFile)) {
        this.logger.log(`Loading configuration from ${envFile}`);
        const envFileContent = fs.readFileSync(envFile);
        const parsedConfig = dotenv.parse(envFileContent);
        Object.assign(this.envConfig, parsedConfig);
      } else {
        this.logger.warn('.env file not found, using process.env');
      }
    } catch (error) {
      this.logger.error(`Error loading .env file: ${error.message}`, error.stack);
    }
  }

  get(key: string, defaultValue: string = ''): string {
    return this.envConfig[key] || process.env[key] || defaultValue;
  }

  getNumber(key: string, defaultValue: number = 0): number {
    const value = this.get(key);
    return value ? parseInt(value, 10) : defaultValue;
  }

  getBoolean(key: string, defaultValue: boolean = false): boolean {
    const value = this.get(key);
    if (!value) {
      return defaultValue;
    }
    return value.toLowerCase() === 'true';
  }

  // Redis configuration
  get redisHost(): string {
    return this.get('REDIS_HOST', 'localhost');
  }

  get redisPort(): number {
    return this.getNumber('REDIS_PORT', 6379);
  }

  get redisTtl(): number {
    return this.getNumber('REDIS_TTL', 3600);
  }

  // Server configuration
  get port(): number {
    return this.getNumber('PORT', 3000);
  }

  get nodeEnv(): string {
    return this.get('NODE_ENV', 'development');
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }
}
