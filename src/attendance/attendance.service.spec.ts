import { Test } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheReadException, CacheWriteException } from '../exceptions/cache.exception';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
            del: jest.fn()
          },
        },
      ],
    }).compile();
    service = module.get<AttendanceService>(AttendanceService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate attendance cache key', () => {
    const classId = '123';
    const studentId = '456';
    const key = service.generateAttendanceCacheKey(classId, studentId);
    expect(key).toContain(`attendance_${classId}_${studentId}`);
  });

  it('should set attendance data', async () => {
    const classId = '123';
    const studentId = '456';
    const status = 'present';
    jest.spyOn(cacheManager, 'set').mockResolvedValue(undefined);

    await service.setAttendanceData(classId, studentId, status);

    expect(cacheManager.set).toHaveBeenCalled();
  });

  it('should get cached data', async () => {
    const key = 'attendance_123_456_2025-04-20';
    const mockData = { status: 'present', timestamp: new Date().toISOString() };
    jest.spyOn(cacheManager, 'get').mockResolvedValue(mockData);

    const result = await service.getCachedData(key);

    expect(cacheManager.get).toHaveBeenCalledWith(key);
    expect(result).toEqual(mockData);
  });

  it('should handle cache miss and fetch from database', async () => {
    const key = 'attendance_123_456_2025-04-20';
    jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
    jest.spyOn(cacheManager, 'set').mockResolvedValue(undefined);

    const result = await service.getCachedData(key);

    expect(cacheManager.get).toHaveBeenCalledWith(key);
    expect(cacheManager.set).toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result.id).toEqual(key);
  });

  it('should throw CacheReadException when get fails', async () => {
    const key = 'attendance_123_456_2025-04-20';
    jest.spyOn(cacheManager, 'get').mockRejectedValue(new Error('Redis connection error'));

    await expect(service.getCachedData(key)).rejects.toThrow(CacheReadException);
  });

  it('should throw CacheWriteException when set fails', async () => {
    const classId = '123';
    const studentId = '456';
    const status = 'present';
    jest.spyOn(cacheManager, 'set').mockRejectedValue(new Error('Redis connection error'));

    await expect(service.setAttendanceData(classId, studentId, status)).rejects.toThrow(CacheWriteException);
  });
});