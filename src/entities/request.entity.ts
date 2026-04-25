/**
 * Time-Off Request Entity
 * 
 * Represents a time-off request submitted by an employee.
 * Tracks the request details and its current status.
 * 
 * Fields:
 * - id: Unique identifier (auto-generated)
 * - employeeId: Unique employee identifier
 * - locationId: Location/branch identifier
 * - requestedDays: Number of days requested
 * - status: Request status (APPROVED, CANCELLED) - default: APPROVED
 * - createdAt: Timestamp when request was created
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class TimeOffRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  employeeId: string;

  @Column()
  locationId: string;

  @Column('float')
  requestedDays: number;

  @Column({ default: 'APPROVED' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
