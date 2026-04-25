/**
 * Time-Off Service
 * 
 * Handles business logic for time-off requests and cancellations.
 * Manages the approval process and balance deductions.
 * 
 * Dependencies:
 * - Balance repository (for checking and updating balances)
 * - TimeOffRequest repository (for creating/canceling requests)
 */

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Balance } from '../entities/balance.entity';
import { TimeOffRequest } from '../entities/request.entity';
import { TimeOffRequestDto } from '../common/dto/timeoff-request.dto';

@Injectable()
export class TimeoffService {
  // Constructor injection of repositories
  constructor(
    @InjectRepository(Balance) private balanceRepo: Repository<Balance>,
    @InjectRepository(TimeOffRequest) private reqRepo: Repository<TimeOffRequest>,
  ) {}

  /**
   * Submit a new time-off request
   * 
   * Validates the request, checks available balance, deducts days,
   * and creates an approved request record.
   * 
   * @param dto - Request DTO containing employeeId, locationId, and days
   * @returns The created time-off request
   * @throws BadRequestException if balance is insufficient or employee not found
   */
  async request(dto: TimeOffRequestDto): Promise<TimeOffRequest> {
    // Find the employee's balance for the specified location
    const bal = await this.balanceRepo.findOne({
      where: { employeeId: dto.employeeId, locationId: dto.locationId },
    });

    // Validate that balance exists for this employee and location
    if (!bal) {
      throw new BadRequestException('Balance not found for this employee and location');
    }

    // Validate that requested days is positive
    if (dto.days <= 0) {
      throw new BadRequestException('Requested days must be greater than zero');
    }

    // Check if employee has sufficient balance
    if (bal.days < dto.days) {
      throw new BadRequestException(
        `Insufficient balance. Available: ${bal.days}, Requested: ${dto.days}`,
      );
    }

    // Deduct the requested days from the balance
    bal.days -= dto.days;
    await this.balanceRepo.save(bal);

    // Create and save the time-off request
    const req = this.reqRepo.create({
      employeeId: dto.employeeId,
      locationId: dto.locationId,
      requestedDays: dto.days,
      status: 'APPROVED',
    });

    return this.reqRepo.save(req);
  }

  /**
   * Cancel an existing time-off request
   * 
   * Cancels a request and restores the days back to the employee's balance.
   * Prevents double-cancellation to avoid corrupting balance data.
   * 
   * @param id - The ID of the time-off request to cancel
   * @returns The updated request with CANCELLED status
   * @throws NotFoundException if request doesn't exist
   * @throws BadRequestException if already cancelled or balance not found
   */
  async cancel(id: number): Promise<TimeOffRequest> {
    // Find the request by ID
    const req = await this.reqRepo.findOne({ where: { id } });

    if (!req) {
      throw new NotFoundException(`Time-off request #${id} not found`);
    }

    // Prevent double-cancellation which would corrupt balance
    if (req.status === 'CANCELLED') {
      throw new BadRequestException(`Request #${id} is already cancelled`);
    }

    // Find the employee's balance to restore days
    const bal = await this.balanceRepo.findOne({
      where: { employeeId: req.employeeId, locationId: req.locationId },
    });

    if (!bal) {
      throw new BadRequestException('Balance record not found — cannot restore days');
    }

    // Restore the days back to the balance
    bal.days += req.requestedDays;
    await this.balanceRepo.save(bal);

    // Update request status to cancelled
    req.status = 'CANCELLED';
    return this.reqRepo.save(req);
  }
}
