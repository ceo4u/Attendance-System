import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OfflineSyncService } from '../offline-sync.service';
import { AttendanceService } from './attendance.service';
import { Logger, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CacheException } from '../exceptions/cache.exception';
import { WsJwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtService } from '../auth/jwt.service';
import { AttendanceDto, SubscribeToClassDto } from '../dtos/attendance.dto';

@WebSocketGateway({
  cors: true,
  namespace: 'attendance',
  transports: ['websocket']
})
export class AttendanceGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  private readonly logger = new Logger(AttendanceGateway.name);
  @WebSocketServer()
  server: Server;

  constructor(
    private attendanceService: AttendanceService,
    private offlineSyncService: OfflineSyncService,
    private jwtService: JwtService
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');

    // Use a middleware to authenticate WebSocket connections
    server.use(async (socket: Socket, next) => {
      try {
        const token = socket.handshake.auth.token ||
                      socket.handshake.headers.authorization?.split(' ')[1];

        if (!token) {
          return next(new Error('Authentication error: Token not provided'));
        }

        const decoded = await this.jwtService.verify(token);
        socket.data.user = decoded;
        this.logger.log(`Authenticated WebSocket connection for user: ${decoded.username}`);
        next();
      } catch (error) {
        this.logger.error(`WebSocket authentication error: ${error.message}`);
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  @SubscribeMessage('markAttendance')
  @UseGuards(WsJwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async handleMarkAttendance(@MessageBody() data: AttendanceDto, @ConnectedSocket() client: Socket): Promise<any> {
    try {
      // Data is already validated by ValidationPipe

      const user = client.data.user;
      this.logger.log(`User ${user.username} marking attendance for class: ${data.classId}, student: ${data.studentId}`);

      // Use the service method to set attendance data
      const cacheKey = await this.attendanceService.setAttendanceData(data.classId, data.studentId, data.status, data.ttl);
      this.logger.log(`Attendance data cached with key: ${cacheKey}`);

      // Broadcast to class room
      this.server.to(`class_${data.classId}`).emit('attendanceUpdate', { studentId: data.studentId, status: data.status });

      // Add to offline queue
      this.offlineSyncService.addToQueue(data);

      // Return acknowledgment
      return { success: true, message: 'Attendance marked successfully', cacheKey };
    } catch (error) {
      this.logger.error(`Error handling mark attendance: ${error.message}`, error.stack);
      if (error instanceof CacheException) {
        throw new WsException(`Cache error: ${error.message}`);
      }
      throw new WsException(`Failed to mark attendance: ${error.message}`);
    }
  }

  @SubscribeMessage('subscribeToClass')
  @UseGuards(WsJwtAuthGuard)
  @UsePipes(new ValidationPipe())
  handleSubscribe(@MessageBody() data: SubscribeToClassDto, @ConnectedSocket() client: Socket): void {
    try {
      // Data is already validated by ValidationPipe

      client.join(`class_${data.classId}`);
      this.logger.log(`Client ${client.id} joined class room: class_${data.classId}`);
    } catch (error) {
      this.logger.error(`Error handling subscribe to class: ${error.message}`, error.stack);
      throw new WsException(`Failed to subscribe to class: ${error.message}`);
    }
  }

  handleConnection(client: Socket): void {
    try {
      this.logger.log(`Client connected: ${client.id}`);
      // Sync offline data when client connects
      this.offlineSyncService.sync();
    } catch (error) {
      this.logger.error(`Error handling client connection: ${error.message}`, error.stack);
      // We can't throw exceptions in connection handlers as they're not part of the WebSocket protocol
      // Instead, we'll emit an error event to the client
      client.emit('error', { message: `Connection error: ${error.message}` });
    }
  }

  handleDisconnect(client: Socket): void {
    try {
      this.logger.log(`Client disconnected: ${client.id}`);
    } catch (error) {
      this.logger.error(`Error handling client disconnection: ${error.message}`, error.stack);
      // We can't throw exceptions in disconnection handlers
    }
  }
}