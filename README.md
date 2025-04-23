<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Attendance System is a NestJS application that provides real-time attendance tracking with caching capabilities using Redis. The system allows marking attendance, retrieving attendance data, and managing the cache through a RESTful API and WebSocket connections.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Testing

### Running Tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### Test Files Organization

The project includes various test files organized as follows:

1. **Unit Tests**
   - Located in the source code directories alongside the files they test
   - Follow the naming convention `*.spec.ts`
   - Example: `src/attendance/attendance.service.spec.ts`

2. **End-to-End Tests**
   - Located in the `test` directory
   - Example: `test/app.e2e-spec.ts`

3. **Test Clients**
   - Located in the root directory
   - `test-rest-api.js` - For testing the REST API endpoints
   - `test-ws-client.js` - For testing WebSocket connections

### Running Test Clients

To test the REST API:
```bash
$ node test-rest-api.js
```

To test WebSocket connections:
```bash
$ node test-ws-client.js
```

## Authentication

This application implements JWT-based authentication for both REST API and WebSocket connections.

### REST API Authentication

1. **Login Endpoint**
   - `POST /auth/login` - Authenticate and receive a JWT token
   - Request body: `{ "username": "admin", "password": "password" }`
   - Response: `{ "access_token": "jwt-token", "user": { "id": "1", "username": "admin", "roles": ["admin"] } }`

2. **Protected Endpoints**
   - All endpoints under `/attendance` are protected and require authentication
   - Include the JWT token in the Authorization header: `Authorization: Bearer your-jwt-token`

### WebSocket Authentication

1. **Connection Authentication**
   - WebSocket connections require authentication via the JWT token
   - Include the token in the `auth` object when connecting: `{ auth: { token: 'your-jwt-token' } }`
   - Alternatively, include it in the Authorization header

2. **Protected Events**
   - All WebSocket events are protected and require authentication
   - The server validates the token for each event

## Caching Implementation

### Overview

This application implements a robust caching strategy using Redis through NestJS's cache manager. The caching system is designed to improve performance by reducing database queries and providing faster response times for attendance data.

### Error Handling

The application implements comprehensive error handling for cache operations:

1. **Custom Exception Classes**
   - `CacheException`: Base exception for all cache-related errors
   - `CacheConnectionException`: For Redis connection issues
   - `CacheReadException`: For errors when reading from cache
   - `CacheWriteException`: For errors when writing to cache
   - `CacheInvalidationException`: For errors when invalidating cache entries

2. **Global Exception Filter**
   - Catches all exceptions and formats them consistently
   - Provides detailed error messages for debugging
   - Logs errors for monitoring and troubleshooting

3. **Graceful Degradation**
   - Falls back to database when cache is unavailable
   - Provides meaningful error messages to clients
   - Implements retry strategies for Redis connections

### Key Features

1. **Cache Key Generation**
   - Consistent cache key format: `attendance_{classId}_{studentId}_{date}`
   - Centralized key generation through the `generateAttendanceCacheKey` method

2. **TTL (Time-To-Live)**
   - Default TTL of 3600 seconds (1 hour)
   - Configurable TTL for different types of data

3. **Cache Invalidation**
   - Individual cache entry invalidation
   - Class-wide cache invalidation

4. **Offline Support**
   - Queue-based system for offline operations
   - Synchronization when connection is restored

### API Endpoints

#### Authentication
- `POST /auth/login` - Authenticate and receive a JWT token

#### Attendance Management
- `GET /attendance/data?key={cacheKey}` - Get cached data by key
- `GET /attendance/student?classId={classId}&studentId={studentId}` - Get attendance data for a student
- `POST /attendance/mark` - Mark attendance with optional TTL

#### Cache Management
- `DELETE /attendance/invalidate/{classId}/{studentId}` - Invalidate specific attendance cache
- `DELETE /attendance/invalidate/class/{classId}` - Invalidate all attendance cache for a class

### WebSocket Events

- `markAttendance` - Mark attendance in real-time
  - Payload: `{ classId: string, studentId: string, status: string, ttl?: number }`
- `subscribeToClass` - Subscribe to attendance updates for a class
  - Payload: `{ classId: string }`
- `attendanceUpdate` - Receive attendance updates
  - Payload: `{ studentId: string, status: string }`

### Redis Cache Structure

- **Keys**: `attendance_{classId}_{studentId}_{date}`
- **Values**: JSON objects containing attendance status and timestamp
- **Example**: `attendance_123_456_2025-04-20` → `{"status":"present","timestamp":"2025-04-20T19:22:00.538Z"}`

### Configuration

The application is configured using environment variables:

```env
# Server Configuration
PORT=3000             # Server port
NODE_ENV=development  # Environment (development, production)

# Redis Configuration
REDIS_HOST=localhost  # Redis server hostname
REDIS_PORT=6379       # Redis server port
REDIS_TTL=3600        # Default TTL in seconds (1 hour)

# JWT Configuration
JWT_SECRET=your-secret-key  # Secret key for JWT signing
JWT_EXPIRES_IN=1h           # JWT expiration time
```

You can override these settings by creating a `.env` file in the project root or by setting environment variables directly.

### Testing the Cache

You can test the Redis cache directly using the Redis CLI:

```bash
$ redis-cli get attendance_123_456_2025-04-20
```

### Error Handling Tests

The application includes tests for error scenarios:

```bash
# Run all tests including error handling tests
$ npm run test

# Run specific tests for error handling
$ npm run test -- attendance.service
```

## Project Structure

```
├── src/                    # Source code
│   ├── attendance/         # Attendance module
│   │   ├── attendance.controller.ts
│   │   ├── attendance.gateway.ts
│   │   ├── attendance.service.ts
│   │   └── *.spec.ts       # Unit tests
│   ├── auth/               # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── jwt-auth.guard.ts
│   │   ├── jwt.service.ts
│   │   └── jwt.strategy.ts
│   ├── config/             # Configuration module
│   ├── dtos/               # Data Transfer Objects
│   │   ├── attendance.dto.ts
│   │   └── auth.dto.ts
│   ├── exceptions/         # Custom exceptions
│   ├── app.module.ts       # Main application module
│   └── main.ts             # Application entry point
├── test/                   # Tests
│   ├── app.e2e-spec.ts     # End-to-end tests
│   ├── jest-e2e.json       # Jest configuration
│   ├── test-client.js      # Simple WebSocket client
│   ├── test-rest-api.js    # REST API test client
│   ├── test-ws-client.js   # Interactive WebSocket client
│   └── check-redis.js      # Redis cache utility
└── logs/                   # Application logs
    ├── combined.log        # All logs
    └── error.log           # Error logs only
```

## Deployment

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
