/**
 * Balance Service
 * 
 * Handles business logic for retrieving employee time-off balances.
 * Provides methods to query balance information from the database.
 * 
 * Dependencies:
 * - Balance repository (TypeORM)
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Balance } from '../entities/balance.entity';

@Injectable()
export class BalanceService {
  // Constructor injection of the Balance repository
  constructor(
    @InjectRepository(Balance) private repo: Repository<Balance>,
  ) {}

  /**
   * Get balance for a specific employee at a specific location
   * 
   * @param employeeId - The unique identifier of the employee
   * @param locationId - The location/branch identifier
   * @returns The balance record if found
   * @throws NotFoundException if no balance exists for the given criteria
   */
  async get(employeeId: string, locationId: string): Promise<Balance> {
    const balance = await this.repo.findOne({ where: { employeeId, locationId } });
    if (!balance) throw new NotFoundException('Balance not found');
    return balance;
  }
}
