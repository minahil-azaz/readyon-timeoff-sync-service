/**
 * Sync Service
 * 
 * Handles synchronization of employee balance data with external HCM system.
 * Supports both real-time single record sync and batch processing.
 * 
 * Dependencies:
 * - Balance repository (for reading/updating balances)
 * - SyncLog repository (for logging sync operations)
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Balance } from '../entities/balance.entity';
import { SyncLog } from '../entities/sync-log.entity';
import { RealtimeSyncDto } from '../common/dto/sync.dto';

@Injectable()
export class SyncService {
  // Constructor injection of repositories
  constructor(
    @InjectRepository(Balance) private repo: Repository<Balance>,
    @InjectRepository(SyncLog) private logRepo: Repository<SyncLog>,
  ) {}

  /**
   * Real-time sync of a single employee balance
   * 
   * Creates a new balance record if it doesn't exist, or updates
   * an existing record with the provided balance data.
   * 
   * @param dto - DTO containing employeeId, locationId, and days
   * @returns The saved balance record
   * @throws BadRequestException if required fields are missing
   */
  async realtime(dto: RealtimeSyncDto): Promise<Balance> {
    // Validate required fields
    if (!dto.employeeId || !dto.locationId) {
      throw new BadRequestException('employeeId and locationId are required');
    }

    // Find existing balance or create new one
    let row = await this.repo.findOne({
      where: { employeeId: dto.employeeId, locationId: dto.locationId },
    });

    if (!row) {
      // Create new balance record
      row = this.repo.create({
        employeeId: dto.employeeId,
        locationId: dto.locationId,
      });
    }

    // Update the days value
    row.days = dto.days;
    const saved = await this.repo.save(row);

    // Log the sync operation for auditing
    await this.logRepo.save(
      this.logRepo.create({ type: 'REALTIME', status: 'SUCCESS' }),
    );

    return saved;
  }

  /**
   * Batch sync of multiple employee balances
   * 
   * Processes an array of balance records by calling realtime sync
   * for each record. Useful for bulk data synchronization.
   * 
   * @param rows - Array of balance records to sync
   * @returns Object with success message and count of processed records
   * @throws BadRequestException if records is not a non-empty array
   */
  async batch(rows: RealtimeSyncDto[]): Promise<{ message: string; count: number }> {
    // Validate input is a non-empty array
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new BadRequestException('records must be a non-empty array');
    }

    // Process each record through realtime sync
    for (const r of rows) {
      await this.realtime(r);
    }

    // Log the batch sync operation
    await this.logRepo.save(
      this.logRepo.create({ type: 'BATCH', status: 'SUCCESS' }),
    );

    return { message: 'Batch synced successfully', count: rows.length };
  }
}
