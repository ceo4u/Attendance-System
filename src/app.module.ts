import { Module } from '@nestjs/common';
import { AttendanceGateway } from './attendance/attendance.gateway';
import { AttendanceController } from './attendance/attendance.controller';
import { AttendanceService } from './attendance/attendance.service';
import { CacheConfigModule } from './cache.config.module';
import { ConfigModule } from './config/config.module';
import { OfflineSyncService } from './offline-sync.service';

@Module({
  imports: [ConfigModule, CacheConfigModule],
  providers: [AttendanceGateway, OfflineSyncService, AttendanceService],
  controllers: [AttendanceController],
})
export class AppModule {}