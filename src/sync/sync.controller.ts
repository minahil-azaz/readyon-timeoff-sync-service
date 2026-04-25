/**
 * Sync Controller
 * 
 * Handles HTTP requests for synchronizing balance data with external HCM.
 * Provides endpoints for real-time and batch synchronization.
 * 
 * Endpoints:
 * - POST /sync/realtime - Sync a single employee balance
 * - POST /sync/batch - Sync multiple employee balances
 */

import { Controller, Post, Body } from '@nestjs/common';
import { SyncService } from './sync.service';
import { RealtimeSyncDto, BatchSyncDto } from '../common/dto/sync.dto';

@Controller('sync')
export class SyncController {
  // Constructor injection of the SyncService
  constructor(private service: SyncService) {}

  /**
   * POST /sync/realtime
   * 
   * Synchronizes a single employee balance in real-time.
   * Creates a new record if it doesn't exist, or updates existing.
   * 
   * @param body - Object with employeeId, locationId, and days
   * @returns The saved balance record
   */
  @Post('realtime')
  realtime(@Body() body: RealtimeSyncDto) {
    return this.service.realtime(body);
  }

  /**
   * POST /sync/batch
   * 
   * Synchronizes multiple employee balances in a batch operation.
   * The request body must contain a 'records' array.
   * 
   * Expected payload format:
   * {
   *   "records": [
   *     { "employeeId": "EMP001", "locationId": "LOC01", "days": 10 },
   *     { "employeeId": "EMP002", "locationId": "LOC01", "days": 5 }
   *   ]
   * }
   * 
   * @param body - Object containing the records array
   * @returns Object with success message and count of synced records
   */
  @Post('batch')
  batch(@Body() body: BatchSyncDto) {
    return this.service.batch(body.records);
  }
}
