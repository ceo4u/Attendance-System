import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceGateway } from './attendance.gateway';
import { AttendanceService } from './attendance.service';
import { OfflineSyncService } from '../offline-sync.service';

describe('AttendanceGateway', () => {
  let gateway: AttendanceGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceGateway,
        {
          provide: AttendanceService,
          useValue: {
            setAttendanceData: jest.fn().mockResolvedValue('mock-cache-key'),
            generateAttendanceCacheKey: jest.fn().mockReturnValue('mock-cache-key')
          }
        },
        {
          provide: OfflineSyncService,
          useValue: {
            addToQueue: jest.fn(),
            sync: jest.fn()
          }
        }
      ],
    }).compile();

    gateway = module.get<AttendanceGateway>(AttendanceGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
