/**
 * Data Transfer Object for Real-Time Sync
 * 
 * Used when syncing a single employee balance in real-time.
 * Validates the required fields for balance synchronization.
 */

import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class RealtimeSyncDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  locationId: string;

  @IsNumber()
  days: number;
}

/**
 * Data Transfer Object for Batch Sync
 * 
 * Used when syncing multiple employee balances in batch.
 * Validates that records is a non-empty array.
 */

import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class BatchSyncDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RealtimeSyncDto)
  records: RealtimeSyncDto[];
}