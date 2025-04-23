import { Controller, Post, Body, HttpException, HttpStatus, Logger, ValidationPipe } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { LoginDto } from '../dtos/auth.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly jwtService: JwtService) {}

  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    try {
      this.logger.log(`Login attempt for user: ${loginDto.username}`);

      // In a real application, you would validate the credentials against a database
      // This is a simplified example for demonstration purposes
      if (loginDto.username === 'admin' && loginDto.password === 'password') {
        const token = await this.jwtService.sign({
          sub: '1',
          username: loginDto.username,
          roles: ['admin']
        });

        this.logger.log(`Login successful for user: ${loginDto.username}`);
        return {
          access_token: token,
          user: {
            id: '1',
            username: loginDto.username,
            roles: ['admin']
          }
        };
      }

      this.logger.warn(`Invalid credentials for user: ${loginDto.username}`);
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    } catch (error) {
      this.logger.error(`Login error for user: ${loginDto.username}`, error.stack);
      throw new HttpException(
        error.message || 'Login failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
