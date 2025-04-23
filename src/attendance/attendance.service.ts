import { Injectable, Inject, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheReadException, CacheWriteException, CacheInvalidationException } from '../exceptions/cache.exception';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  /**
   * Sets attendance data in the cache
   * @param classId The class ID
   * @param studentId The student ID
   * @param status The attendance status
   * @returns The cache key used
   */
  /**
   * Sets attendance data in the cache with TTL
   * @param classId The class ID
   * @param studentId The student ID
   * @param status The attendance status
   * @param ttl Time to live in seconds (default: 3600 seconds = 1 hour)
   * @returns The cache key used
   */
  async setAttendanceData(classId: string, studentId: string, status: string, ttl: number = 3600): Promise<string> {
    try {
      const cacheKey = this.generateAttendanceCacheKey(classId, studentId);
      this.logger.log(`Setting attendance data with key: ${cacheKey} (TTL: ${ttl} seconds)`);
      await this.cacheManager.set(cacheKey, { status, timestamp: new Date() }, ttl);
      this.logger.log(`Attendance data set successfully with key: ${cacheKey}`);
      return cacheKey;
    } catch (error) {
      this.logger.error(`Failed to set attendance data for class: ${classId}, student: ${studentId}`, error.stack);
      throw new CacheWriteException(`attendance_${classId}_${studentId}`, error.message);
    }
  }

  /**
   * Generates a consistent cache key for attendance data
   * @param classId The class ID
   * @param studentId The student ID
   * @returns The generated cache key
   */
  generateAttendanceCacheKey(classId: string, studentId: string): string {
    const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
    const cacheKey = `attendance_${classId}_${studentId}_${dateStr}`;
    console.log(`Service: Generated attendance cache key: ${cacheKey}`);
    return cacheKey;
  }
  /**
   * Gets cached data by key
   * @param key The cache key
   * @returns The cached data or data from database
   */
  async getCachedData(key: string): Promise<any> {
    try {
      this.logger.log(`Checking cache for key: ${key}`);
      const cachedData = await this.cacheManager.get(key);
      if (cachedData) {
        this.logger.log(`Cache hit for key: ${key}`);
        return cachedData;
      }
      this.logger.log(`Cache miss for key: ${key}`);
      // If not cached, fetch from database and cache it
      const newData = await this.fetchDataFromDatabase(key);
      this.logger.log(`Caching data with key: ${key}`);
      await this.cacheManager.set(key, newData);
      return newData;
    } catch (error) {
      this.logger.error(`Failed to get cached data for key: ${key}`, error.stack);
      throw new CacheReadException(key, error.message);
    }
  }

  /**
   * Gets attendance data for a specific class and student
   * @param classId The class ID
   * @param studentId The student ID
   * @returns The attendance data
   */
  async getAttendanceData(classId: string, studentId: string): Promise<any> {
    const cacheKey = this.generateAttendanceCacheKey(classId, studentId);
    console.log(`Service: Getting attendance data with key: ${cacheKey}`);
    return this.getCachedData(cacheKey);
  }

  /**
   * Caches data with a specified TTL
   * @param key The cache key
   * @param value The value to cache
   * @param ttl Time to live in seconds (default: 3600 seconds = 1 hour)
   */
  async cacheData(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      this.logger.log(`Caching data with key: ${key} (TTL: ${ttl} seconds)`);
      await this.cacheManager.set(key, value, ttl);
      this.logger.log(`Data cached successfully with key: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to cache data for key: ${key}`, error.stack);
      throw new CacheWriteException(key, error.message);
    }
  }

  /**
   * Invalidates a specific cache entry
   * @param key The cache key to invalidate
   */
  async invalidateCache(key: string): Promise<void> {
    try {
      this.logger.log(`Invalidating cache for key: ${key}`);
      await this.cacheManager.del(key);
      this.logger.log(`Cache invalidated for key: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to invalidate cache for key: ${key}`, error.stack);
      throw new CacheInvalidationException(key, error.message);
    }
  }

  /**
   * Invalidates attendance data for a specific class and student
   * @param classId The class ID
   * @param studentId The student ID
   */
  async invalidateAttendanceCache(classId: string, studentId: string): Promise<void> {
    const cacheKey = this.generateAttendanceCacheKey(classId, studentId);
    await this.invalidateCache(cacheKey);
  }

  /**
   * Invalidates all attendance data for a specific class
   * @param classId The class ID
   */
  async invalidateClassAttendanceCache(classId: string): Promise<void> {
    console.log(`Service: Invalidating all attendance data for class: ${classId}`);
    // In a real implementation, you would need to find all keys matching the pattern
    // and delete them individually. This is a simplified version.
    // Note: This is a mock implementation since the cache-manager doesn't expose a direct way to get all keys
    // In a real application, you might use Redis commands directly or maintain a list of keys
    console.log(`Service: Simulating cache invalidation for class: ${classId}`);

    // For demonstration purposes, we'll just log that we're invalidating the cache
    // In a real implementation, you would need to track which keys belong to which class
    // and invalidate them individually
    console.log(`Service: Cache invalidated for class: ${classId}`);
  }

  private async fetchDataFromDatabase(key: string): Promise<any> {
    try {
      // Implement your database fetching logic here
      // This is just a placeholder
      this.logger.log(`Fetching data for key: ${key}`);
      // Simulate database access
      return { id: key, timestamp: new Date().toISOString() };
    } catch (error) {
      this.logger.error(`Failed to fetch data from database for key: ${key}`, error.stack);
      throw new HttpException(`Failed to fetch data from database: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}