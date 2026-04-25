/**
 * Application Module
 * 
 * Root module of the NestJS application that configures:
 * - Database connection (TypeORM with SQLite)
 * - Entity definitions
 * - Controllers and their routes
 * - Service providers
 * 
 * This module follows the modular architecture pattern where
 * each feature (balance, timeoff, sync) has its own controller
 * and service, registered here in the root module.
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entity imports - defines database schema
import { Balance } from './entities/balance.entity';
import { TimeOffRequest } from './entities/request.entity';
import { SyncLog } from './entities/sync-log.entity';

// Controller imports - handle HTTP requests
import { BalanceController } from './balance/balance.controller';
import { TimeoffController } from './timeoff/timeoff.controller';
import { SyncController } from './sync/sync.controller';

// Service imports - contain business logic
import { BalanceService } from './balance/balance.service';
import { TimeoffService } from './timeoff/timeoff.service';
import { SyncService } from './sync/sync.service';

@Module({
  imports: [
    // Configure TypeORM with SQLite database
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [Balance, TimeOffRequest, SyncLog],
      synchronize: true, // Auto-create tables (dev only - disable in production)
    }),
    // Register entity repositories for dependency injection
    TypeOrmModule.forFeature([Balance, TimeOffRequest, SyncLog]),
  ],
  // Register controllers that handle incoming requests
  controllers: [BalanceController, TimeoffController, SyncController],
  // Register services that contain business logic
  providers: [BalanceService, TimeoffService, SyncService],
})
export class AppModule {}
