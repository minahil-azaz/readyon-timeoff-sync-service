# Technical Requirements Document (TRD)

## ReadyOn Time-Off Sync Service

---

## 1. Problem Understanding

### 1.1 Business Context

The ReadyOn Time-Off Service is a backend microservice that manages employee time-off requests while synchronizing balance data with an external HCM (Human Capital Management) system.

### 1.2 Core Problem

Companies need to:
1. Allow employees to request time off
2. Validate that employees have sufficient balance
3. Track request status (approved, cancelled)
4. Keep balance data in sync with HCM system
5. Handle edge cases gracefully (double-cancel, insufficient balance, unknown employees)

### 1.3 User Stories

| ID | Story | Priority |
|----|-------|----------|
| US1 | As an employee, I want to submit a time-off request so I can book leave | Must |
| US2 | As an employee, I want to cancel a request and restore my balance | Must |
| US3 | As an admin, I want to query employee balances | Must |
| US4 | As an HCM system, I want to sync balance data in real-time | Must |
| US5 | As an HCM system, I want to batch sync multiple employee balances | Should |

---

## 2. System Design

### 2.1 Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Employee      │────▶│  ReadyOn Service │────▶│   SQLite    │
│   (Client)      │     │   (NestJS)       │     │  Database   │
└─────────────────┘     └────────┬─────────┘     └─────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │   Mock HCM       │
                        │   (External)     │
                        └──────────────────┘
```

### 2.2 Technology Choices

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Framework | NestJS 10 | Modular, TypeScript-first, excellent testing support |
| Database | SQLite | Zero-config, file-based, perfect for microservice |
| ORM | TypeORM | Mature, TypeScript support, easy schema management |
| Validation | class-validator | Decorator-based, integrates with NestJS pipes |
| Testing | Jest + Supertest | Industry standard, async support |

### 2.3 Database Schema

#### Balance Entity
```typescript
{
  id: number (PK, auto-increment)
  employeeId: string (indexed)
  locationId: string (indexed)
  days: number
  updatedAt: Date
}
```
**Unique Constraint**: (employeeId, locationId)

#### Request Entity
```typescript
{
  id: number (PK, auto-increment)
  employeeId: string (indexed)
  locationId: string
  days: number
  status: 'APPROVED' | 'CANCELLED'
  createdAt: Date
  updatedAt: Date
}
```

#### SyncLog Entity
```typescript
{
  id: number (PK, auto-increment)
  employeeId: string
  locationId: string
  syncedAt: Date
}
```

---

## 3. Data Flow

### 3.1 Time-Off Request Flow

```
Client Request
     │
     ▼
┌─────────────────┐
│ Validation Pipe │ ──▶ employee exists?
│                 │ ──▶ balance sufficient?
│                 │ ──▶ days > 0?
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ TimeOff Service │
│                 │ ──▶ Deduct balance
│                 │ ──▶ Save request (APPROVED)
└────────┬────────┘
         │
         ▼
    Response (201)
```

### 3.2 Cancel Request Flow

```
Client Cancel
     │
     ▼
┌─────────────────┐
│ Validation      │ ──▶ request exists?
│                 │ ──▶ not already cancelled?
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ TimeOff Service │
│                 │ ──▶ Restore balance
│                 │ ──▶ Update status to CANCELLED
└────────┬────────┘
         │
         ▼
    Response (200)
```

### 3.3 HCM Sync Flow

```
HCM Payload
     │
     ▼
┌─────────────────┐
│ Validation      │ ──▶ valid payload?
│                 │ ──▶ records not empty (batch)?
└────────┬────────┘
         │
     ┌───┴───┐
     │       │
     ▼       ▼
 Realtime  Batch
  (one)   (many)
     │       │
     ▼       ▼
┌─────────────────┐
│ Sync Service    │
│                 │ ──▶ Upsert balance (INSERT or UPDATE)
│                 │ ──▶ Log sync operation
└────────┬────────┘
         │
         ▼
    Response (201)
```

---

## 4. Sync Strategy

### 4.1 Realtime Sync

- **Endpoint**: `POST /sync/realtime`
- **Use Case**: HCM sends single employee balance update
- **Operation**: Upsert (insert if not exists, update if exists)
- **Idempotency**: Safe to retry - same employee+location overwrites

### 4.2 Batch Sync

- **Endpoint**: `POST /sync/batch`
- **Use Case**: HCM sends multiple employee balances at once
- **Operation**: Bulk upsert
- **Payload**: `{ "records": [...] }` (wrapped array, not raw array)
- **Error Handling**: Reject empty records array with 400

### 4.3 Why Upsert?

```typescript
// Using TypeORM's save() - automatically handles insert or update
await this.balanceRepository.save({ employeeId, locationId, days });
```

This approach:
- ✅ Simplifies code (no separate insert/update logic)
- ✅ Handles first-time sync and updates uniformly
- ✅ Safe for HCM retry scenarios

---

## 5. Failure Handling

### 5.1 Error Scenarios

| Scenario | HTTP Code | Message |
|----------|-----------|---------|
| Employee not found | 404 | "Balance not found for employee" |
| Insufficient balance | 400 | "Insufficient balance" |
| Zero days requested | 400 | "Days must be greater than 0" |
| Request already cancelled | 400 | "Request is already cancelled" |
| Request not found | 404 | "Request not found" |
| Empty batch records | 400 | "Records array cannot be empty" |

### 5.2 Defensive Measures

1. **Double-Cancel Protection**: Check status before cancelling
2. **Balance Validation**: Verify sufficient balance before approval
3. **Input Validation**: Reject invalid payloads early
4. **Graceful 404s**: Clear error messages for missing resources

---

## 6. Concurrency Handling

### 6.1 Current Approach

- **Database**: SQLite (single-writer, file-level locking)
- **ORM**: TypeORM with default transaction behavior

### 6.2 Limitations & Trade-offs

| Aspect | Current | Production Recommendation |
|--------|---------|---------------------------|
| Database | SQLite | PostgreSQL (for concurrency) |
| Locking | File-level | Row-level locks |
| Connection | Single | Connection pool |

### 6.3 Future Improvements

For production with high concurrency:
1. Switch to PostgreSQL
2. Use optimistic locking (version field)
3. Implement retry logic for transient failures
4. Add request queuing for batch operations

---

## 7. Trade-offs & Design Decisions

### 7.1 SQLite vs PostgreSQL

| Factor | SQLite | PostgreSQL |
|--------|--------|------------|
| Setup | Zero-config | Requires running instance |
| Concurrency | Limited | Full ACID |
| Production readies | No | Yes |
| **Decision** | Dev/Prototype | Future upgrade |

### 7.2 In-Memory Test Database

- **Why**: Each test gets fresh database state
- **How**: `typeorm://:memory:` in test config
- **Benefit**: Tests are isolated, no shared state

### 7.3 DTOs Over Any Type

- **Why**: Type safety, validation, documentation
- **How**: class-validator decorators on DTOs
- **Benefit**: Compile-time errors, self-documenting APIs

### 7.4 Batch Payload Wrapper

- **Why**: NestJS can't reliably parse raw JSON arrays
- **How**: `{ "records": [...] }` wrapper
- **Trade-off**: Slightly more complex client code

---

## 8. API Contract Summary

| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/balances/:employeeId/:locationId` | - | Balance object |
| POST | `/timeoff/request` | TimeOffRequestDTO | Request object |
| POST | `/timeoff/:id/cancel` | - | Cancelled request |
| POST | `/sync/realtime` | SyncDTO | Balance object |
| POST | `/sync/batch` | BatchSyncDTO | `{ synced: number }` |

---

## 9. Testing Strategy

### 9.1 E2E Tests

- **Framework**: Jest + Supertest
- **Scope**: Full HTTP request/response cycle
- **Database**: In-memory SQLite (fresh per run)
- **Coverage**: 12 test cases covering all endpoints

### 9.2 Test Categories

| Category | Count | Examples |
|----------|-------|----------|
| Balance queries | 2 | Get existing, 404 unknown |
| Time-off requests | 4 | Submit, insufficient balance, zero days, unknown employee |
| Cancel operations | 3 | Cancel, double-cancel, 404 |
| Sync operations | 3 | Realtime, batch, empty batch |

---

## 10. Future Enhancements

| Feature | Description | Priority |
|---------|-------------|----------|
| Authentication | JWT-based auth | Should |
| Audit logging | Track all changes | Should |
| Rate limiting | Prevent abuse | Could |
| Webhooks | Notify on status change | Could |
| Multi-tenant | Support multiple companies | Could |

---

## 11. Conclusion

This service provides a solid foundation for time-off management with HCM synchronization. The architecture is clean, testable, and extensible. For production deployment, the primary upgrades would be:

1. **Database**: SQLite → PostgreSQL
2. **Error Handling**: Add global exception filter
3. **Logging**: Structured logging (e.g., Winston)
4. **Monitoring**: Health checks, metrics

The current implementation demonstrates:
- Clean separation of concerns (controllers/services/entities)
- Type-safe APIs with DTOs
- Comprehensive error handling
- Idempotent sync operations
- Full E2E test coverage

---

