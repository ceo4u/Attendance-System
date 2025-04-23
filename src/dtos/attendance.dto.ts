import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

export class AttendanceDto {
  @IsString()
  @IsNotEmpty()
  classId: string;

  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsEnum(AttendanceStatus)
  @IsNotEmpty()
  status: AttendanceStatus;

  @IsOptional()
  @IsNumber()
  @Min(60)   // Minimum 1 minute
  @Max(86400) // Maximum 24 hours
  ttl?: number;
}

export class GetAttendanceDto {
  @IsString()
  @IsNotEmpty()
  classId: string;

  @IsString()
  @IsNotEmpty()
  studentId: string;
}

export class SubscribeToClassDto {
  @IsString()
  @IsNotEmpty()
  classId: string;
}
