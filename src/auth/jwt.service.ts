import { Injectable } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';

@Injectable()
export class JwtService {
  private readonly secretKey = process.env.JWT_SECRET || 'your-secret-key';

  get secret(): string {
    return this.secretKey;
  }

  async sign(payload: any): Promise<string> {
    return sign(payload, this.secretKey, { expiresIn: '1h' });
  }

  async verify(token: string): Promise<any> {
    try {
      return verify(token, this.secretKey);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
