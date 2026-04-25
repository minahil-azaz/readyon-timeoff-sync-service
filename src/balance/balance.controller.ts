/**
 * Balance Controller
 * 
 * Handles HTTP requests related to employee time-off balances.
 * Provides endpoints for retrieving balance information.
 * 
 * Endpoints:
 * - GET /balances/:employeeId/:locationId - Get balance for employee at location
 */

import { Controller, Get, Param } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { BalanceQueryDto } from '../common/dto/balance-query.dto';

@Controller('balances')
export class BalanceController {
  // Constructor injection of the BalanceService
  constructor(private service: BalanceService) {}

  /**
   * GET /balances/:employeeId/:locationId
   * 
   * Retrieves the time-off balance for a specific employee at a specific location.
   * 
   * @param employeeId - The employee identifier from URL params
   * @param locationId - The location identifier from URL params
   * @returns Balance information including available days
   */
  @Get(':employeeId/:locationId')
  get(
    @Param() params: BalanceQueryDto,
  ) {
    return this.service.get(params.employeeId, params.locationId);
  }
}
