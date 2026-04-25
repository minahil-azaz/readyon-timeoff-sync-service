/**
 * Sync Log Entity
 * 
 * Tracks synchronization operations with the external HCM system.
 * Used for auditing and debugging sync operations.
 * 
 * Fields:
 * - id: Unique identifier (auto-generated)
 * - type: Type of sync (REALTIME, BATCH)
 * - status: Status of the sync operation (SUCCESS, FAILED)
 * - createdAt: Timestamp when the sync occurred
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class SyncLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
