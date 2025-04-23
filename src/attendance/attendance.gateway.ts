import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OfflineSyncService } from '../offline-sync.service';
import { AttendanceService } from './attendance.service';
import { Logger } from '@nestjs/common';
import { CacheException } from '../exceptions/cache.exception';

@WebSocketGateway({ cors: true }) // Enable CORS for testing
export class AttendanceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(AttendanceGateway.name);
  @WebSocketServer()
  server: Server;

  constructor(
    private attendanceService: AttendanceService,
    private offlineSyncService: OfflineSyncService
  ) {}


  @SubscribeMessage('markAttendance')
  async handleMarkAttendance(@MessageBody() data: any): Promise<void> {
    try {
      const { classId, studentId, status } = data;

      // Validate input data
      if (!classId || !studentId || !status) {
        throw new WsException('Class ID, Student ID, and status are required');
      }

      this.logger.log(`Received attendance data for class: ${classId}, student: ${studentId}`);

      // Use the service method to set attendance data
      const cacheKey = await this.attendanceService.setAttendanceData(classId, studentId, status);
      this.logger.log(`Attendance data cached with key: ${cacheKey}`);

      // Broadcast to class room
      this.server.to(`class_${classId}`).emit('attendanceUpdate', { studentId, status });

      // Add to offline queue
      this.offlineSyncService.addToQueue(data);
    } catch (error) {
      this.logger.error(`Error handling mark attendance: ${error.message}`, error.stack);
      if (error instanceof CacheException) {
        throw new WsException(`Cache error: ${error.message}`);
      }
      throw new WsException(`Failed to mark attendance: ${error.message}`);
    }
  }

  @SubscribeMessage('subscribeToClass')
  handleSubscribe(@MessageBody() data: { classId: string }, @ConnectedSocket() client: Socket): void {
    try {
      // Validate input data
      if (!data.classId) {
        throw new WsException('Class ID is required');
      }

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