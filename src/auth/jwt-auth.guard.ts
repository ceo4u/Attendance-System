import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WsException } from '@nestjs/websockets';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private jwtService: JwtService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new Error('Unauthorized');
    }
    return user;
  }
}

@Injectable()
export class WsJwtAuthGuard {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient();
      const authToken = client.handshake.headers.authorization?.split(' ')[1];
      
      if (!authToken) {
        throw new WsException('Unauthorized - No token provided');
      }
      
      const decoded = await this.jwtService.verify(authToken);
      client.user = decoded;
      return true;
    } catch (error) {
      throw new WsException('Unauthorized - Invalid token');
    }
  }
}
