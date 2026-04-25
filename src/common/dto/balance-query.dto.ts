/**
 * Data Transfer Object for Balance Query
 * 
 * Used when retrieving an employee's time-off balance.
 * Validates the required parameters from the URL.
 */

import { IsString, IsNotEmpty } from 'class-validator';

export class BalanceQueryDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  locationId: string;
}