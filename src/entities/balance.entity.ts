/**
 * Balance Entity
 * 
 * Represents an employee's time-off balance for a specific location.
 * This entity stores the available days an employee has for time-off.
 * 
 * Fields:
 * - id: Unique identifier (auto-generated)
 * - employeeId: Unique employee identifier
 * - locationId: Location/branch identifier
 * - days: Available time-off days (default: 0)
 */

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Balance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  employeeId: string;

  @Column()
  locationId: string;

  @Column('float', { default: 0 })
  days: number;
}
