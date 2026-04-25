"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const balance_entity_1 = require("./entities/balance.entity");
const request_entity_1 = require("./entities/request.entity");
const sync_log_entity_1 = require("./entities/sync-log.entity");
const balance_controller_1 = require("./balance/balance.controller");
const balance_service_1 = require("./balance/balance.service");
const timeoff_controller_1 = require("./timeoff/timeoff.controller");
const timeoff_service_1 = require("./timeoff/timeoff.service");
const sync_controller_1 = require("./sync/sync.controller");
const sync_service_1 = require("./sync/sync.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'sqlite',
                database: 'db.sqlite',
                entities: [balance_entity_1.Balance, request_entity_1.TimeOffRequest, sync_log_entity_1.SyncLog],
                synchronize: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([balance_entity_1.Balance, request_entity_1.TimeOffRequest, sync_log_entity_1.SyncLog]),
        ],
        controllers: [balance_controller_1.BalanceController, timeoff_controller_1.TimeoffController, sync_controller_1.SyncController],
        providers: [balance_service_1.BalanceService, timeoff_service_1.TimeoffService, sync_service_1.SyncService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map