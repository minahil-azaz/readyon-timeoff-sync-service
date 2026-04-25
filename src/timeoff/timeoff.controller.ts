/**
 * Time-Off Controller
 * 
 * Handles HTTP requests related to time-off management.
 * Provides endpoints for submitting and canceling time-off requests.
 * 
 * Endpoints:
 * - POST /timeoff/request - Submit a new time-off request
 * - POST /timeoff/:id/cancel - Cancel an existing request
 */

import { Controller, Post, Body, Param, HttpCode, ParseIntPipe } from '@nestjs/common';
import { TimeoffService } from './timeoff.service';
import { TimeOffRequestDto } from '../common/dto/timeoff-request.dto';

@Controller('timeoff')
export class TimeoffController {
  // Constructor injection of the TimeoffService
  constructor(private service: TimeoffService) {}

  /**
   * POST /timeoff/request
   * 
   * Submits a new time-off request for an employee.
   * The request is automatically approved if sufficient balance exists.
   * 
   * @param body - Request body with employeeId, locationId, and days
   * @returns The created time-off request with APPROVED status
   */
  @Post('request')
  request(@Body() body: TimeOffRequestDto) {
    return this.service.request(body);
  }

  /**
   * POST /timeoff/:id/cancel
   * 
   * Cancels an existing time-off request and restores days to balance.
   * Returns HTTP 200 on success.
   * 
   * @param id - The ID of the request to cancel (from URL params)
   * @returns The updated request with CANCELLED status
   */
  @Post(':id/cancel')
  @HttpCode(200)
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.service.cancel(id);
  }
}
