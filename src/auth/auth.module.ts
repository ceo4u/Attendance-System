import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { JwtService } from './jwt.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [PassportModule],
  providers: [JwtStrategy, JwtService],
  controllers: [AuthController],
  exports: [JwtService],
})
export class AuthModule {}
