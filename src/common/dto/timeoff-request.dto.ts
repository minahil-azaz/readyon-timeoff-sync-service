/**
 * Data Transfer Object for Time-Off Request
 * 
 * Used when submitting a new time-off request.
 * Validates the required fields and their types.
 */

import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class TimeOffRequestDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  locationId: string;

  @IsNumber()
  @IsPositive()
  days: number;
}