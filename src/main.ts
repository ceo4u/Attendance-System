import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './exceptions/exceptions.filter';
import { ValidationPipe } from '@nestjs/common';
import * as passport from 'passport';
import * as winston from 'winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure Winston logger
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.printf(({ level, message, timestamp }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
      })
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
  });

  // Apply global pipes and filters
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  app.useGlobalFilters(new AllExceptionsFilter());

  // Initialize Passport
  app.use(passport.initialize());

  // Enable CORS
  app.enableCors();

  // Start the server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.info(`Application is running on: http://localhost:${port}`);

  // Enable shutdown hooks
  app.enableShutdownHooks();
}
bootstrap();
