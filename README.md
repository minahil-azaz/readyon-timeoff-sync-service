# ReadyOn Time-Off Sync Service

A NestJS microservice for managing employee time-off requests with HCM synchronization capabilities.

---

## 📋 Problem Statement

Companies need to manage employee time-off requests while keeping balance data synchronized with their HCM (Human Capital Management) system. This service provides:

- **Time-off request lifecycle**: Submit, approve, and cancel leave requests
- **Balance validation**: Ensure employees have sufficient balance before approval
- **HCM synchronization**: Real-time and batch sync from external HCM systems
- **Data consistency**: Handle edge cases like duplicate syncs and concurrent updates

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | NestJS 10 |
| Database | SQLite (via TypeORM) |
| Language | TypeScript |
| Testing | Jest + Supertest |
| Validation | class-validator + class-transformer |

---

## ✨ Features

1. **Time-Off Request Management**
   - Submit leave requests with automatic balance deduction
   - Cancel requests and restore balance
   - Validate sufficient balance before approval
   - Reject zero/negative day requests

2. **Balance Management**
   - Per-employee, per-location balance tracking
   - Real-time balance queries
   - Automatic balance restoration on cancellation

3. **HCM Synchronization**
   - **Realtime sync**: Single record upsert from HCM
   - **Batch sync**: Multiple records in one request
   - Idempotent operations (safe for retries)

4. **Defensive Handling**
   - Double-cancel protection
   - Unknown employee/location validation
   - Graceful error responses

---

## 🚀 Setup & Run

```bash
# Install dependencies
npm install

# Start development server (watch mode)
npm run start:dev

# Build for production
npm run build
```

Server runs at: **http://localhost:3000**

---

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run tests with coverage
npm run test:cov
```

**Test Results**: 12 E2E tests passing

---

## 📡 API Endpoints

### 1. Get Balance

```
GET /balances/:employeeId/:locationId
```

**Response** (200):
```json
{
  "employeeId": "EMP001",
  "locationId": "LOC01",
  "days": 10
}
```

**Response** (404): Employee not found

---

### 2. Submit Time-Off Request

```
POST /timeoff/request
Content-Type: application/json

{
  "employeeId": "EMP001",
  "locationId": "LOC01",
  "days": 2
}
```

**Response** (201):
```json
{
  "id": 1,
  "employeeId": "EMP001",
  "locationId": "LOC01",
  "days": 2,
  "status": "APPROVED",
  "createdAt": "2026-04-25T10:00:00.000Z"
}
```

**Error Responses**:
- 400: Insufficient balance, zero days, or unknown employee
- 404: Employee not found

---

### 3. Cancel Time-Off Request

```
POST /timeoff/:id/cancel
```

**Response** (200):
```json
{
  "id": 1,
  "status": "CANCELLED"
}
```

**Error Responses**:
- 400: Request already cancelled
- 404: Request not found

---

### 4. Realtime Sync (HCM → Service)

```
POST /sync/realtime
Content-Type: application/json

{
  "employeeId": "EMP001",
  "locationId": "LOC01",
  "days": 15
}
```

**Response** (201):
```json
{
  "employeeId": "EMP001",
  "locationId": "LOC01",
  "days": 15
}
```

---

### 5. Batch Sync (HCM → Service)

```
POST /sync/batch
Content-Type: application/json

{
  "records": [
    { "employeeId": "EMP001", "locationId": "LOC01", "days": 10 },
    { "employeeId": "EMP002", "locationId": "LOC01", "days": 5 }
  ]
}
```

**Response** (201):
```json
{
  "synced": 2
}
```

**Error Response** (400): Empty records array

---

## 🏗 Architecture

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

### Data Flow

1. **Time-Off Request Flow**:
   - Client submits request → Service validates balance → Deducts balance → Saves request

2. **Cancel Flow**:
   - Client cancels request → Service validates ownership → Restores balance → Marks cancelled

3. **HCM Sync Flow**:
   - HCM sends data → Service upserts balance record → Confirms sync

---

## 📁 Project Structure

```
files-1/
├── src/
│   ├── main.ts                 # Application entry point
│   ├── app.module.ts           # Root module
│   ├── balance/                # Balance feature
│   │   ├── balance.controller.ts
│   │   ├── balance.service.ts
│   │   └── dto/
│   ├── timeoff/                # Time-off feature
│   │   ├── timeoff.controller.ts
│   │   ├── timeoff.service.ts
│   │   └── dto/
│   ├── sync/                   # Sync feature
│   │   ├── sync.controller.ts
│   │   ├── sync.service.ts
│   │   └── dto/
│   ├── entities/               # TypeORM entities
│   │   ├── balance.entity.ts
│   │   ├── request.entity.ts
│   │   └── sync-log.entity.ts
│   └── common/dto/             # Shared DTOs
├── test/
│   ├── app.e2e-spec.ts         # E2E tests
│   └── jest-e2e.json           # Jest config
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## ⚙️ Assumptions & Design Decisions

1. **HCM as Source of Truth**: Balance data comes from HCM system; service mirrors it
2. **Per-Employee + Location**: Balances are unique per (employeeId, locationId) pair
3. **Idempotent Sync**: Realtime/batch sync operations are safe to retry
4. **SQLite for Simplicity**: Single-file database for easy setup and testing
5. **In-Memory Test DB**: E2E tests use fresh database per run

---

## 🔧 Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Server port |
| DATABASE_PATH | db.sqlite | SQLite file path |

---

## 📄 License

MIT
