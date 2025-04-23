import { Controller, Get, Post, Delete, Body, Query, Param, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { CacheException } from '../exceptions/cache.exception';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  private readonly logger = new Logger(AttendanceController.name);
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('data')
  async getData(@Query('key') key: string) {
    try {
      this.logger.log(`Getting data for key: ${key}`);
      if (!key) {
        throw new HttpException('Cache key is required', HttpStatus.BAD_REQUEST);
      }
      const result = await this.attendanceService.getCachedData(key);
      this.logger.log(`Retrieved data for key: ${key}`);
      return result;
    } catch (error) {
      this.logger.error(`Error getting data for key: ${key}`, error.stack);
      if (error instanceof CacheException || error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to get data: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('student')
  async getStudentAttendance(
    @Query('classId') classId: string,
    @Query('studentId') studentId: string
  ) {
    try {
      this.logger.log(`Getting attendance for class: ${classId}, student: ${studentId}`);
      if (!classId || !studentId) {
        throw new HttpException('Class ID and Student ID are required', HttpStatus.BAD_REQUEST);
      }
      const result = await this.attendanceService.getAttendanceData(classId, studentId);
      this.logger.log(`Retrieved attendance data for class: ${classId}, student: ${studentId}`);
      return result;
    } catch (error) {
      this.logger.error(`Error getting attendance data for class: ${classId}, student: ${studentId}`, error.stack);
      if (error instanceof CacheException || error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to get attendance data: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('mark')
  async markAttendance(@Body() data: { classId: string; studentId: string; status: string; ttl?: number }) {
    try {
      this.logger.log(`Marking attendance for class: ${data.classId}, student: ${data.studentId}`);

      // Validate input data
      if (!data.classId || !data.studentId || !data.status) {
        throw new HttpException('Class ID, Student ID, and status are required', HttpStatus.BAD_REQUEST);
      }

      // Use the service method to set attendance data and get the cache key
      const cacheKey = await this.attendanceService.setAttendanceData(
        data.classId,
        data.studentId,
        data.status,
        data.ttl || 3600 // Default TTL is 1 hour if not provided
      );

      this.logger.log(`Attendance marked successfully with key: ${cacheKey}`);
      return { message: 'Attendance marked', cacheKey };
    } catch (error) {
      this.logger.error(`Error marking attendance for class: ${data.classId}, student: ${data.studentId}`, error.stack);
      if (error instanceof CacheException || error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to mark attendance: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('invalidate/:classId/:studentId')
  async invalidateAttendance(@Param('classId') classId: string, @Param('studentId') studentId: string) {
    try {
      this.logger.log(`Invalidating attendance cache for class: ${classId}, student: ${studentId}`);
      if (!classId || !studentId) {
        throw new HttpException('Class ID and Student ID are required', HttpStatus.BAD_REQUEST);
      }
      await this.attendanceService.invalidateAttendanceCache(classId, studentId);
      return { message: 'Attendance cache invalidated' };
    } catch (error) {
      this.logger.error(`Error invalidating attendance cache for class: ${classId}, student: ${studentId}`, error.stack);
      if (error instanceof CacheException || error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to invalidate attendance cache: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('invalidate/class/:classId')
  async invalidateClassAttendance(@Param('classId') classId: string) {
    try {
      this.logger.log(`Invalidating all attendance cache for class: ${classId}`);
      if (!classId) {
        throw new HttpException('Class ID is required', HttpStatus.BAD_REQUEST);
      }
      await this.attendanceService.invalidateClassAttendanceCache(classId);
      return { message: 'Class attendance cache invalidated' };
    } catch (error) {
      this.logger.error(`Error invalidating class attendance cache for class: ${classId}`, error.stack);
      if (error instanceof CacheException || error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to invalidate class attendance cache: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}