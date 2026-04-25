# ReadyOn Time-Off Microservice

## Stack
- NestJS 10
- SQLite (via TypeORM)
- TypeScript
- Jest + Supertest

---

## Setup & Run

```bash
npm install
npm run start:dev
```

Server starts at: `http://localhost:3000`

---

## API Endpoints

### Get Balance
```
GET /balances/:employeeId/:locationId
```

### Request Leave
```
POST /timeoff/request
Content-Type: application/json

{
  "employeeId": "EMP001",
  "locationId": "LOC01",
  "days": 2
}
```

### Cancel Request
```
POST /timeoff/:id/cancel
```

### Realtime Sync (single record from HCM)
```
POST /sync/realtime
Content-Type: application/json

{
  "employeeId": "EMP001",
  "locationId": "LOC01",
  "days": 15
}
```

### Batch Sync (multiple records from HCM)
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

> **Note:** Batch payload uses `{ "records": [...] }` wrapper — NestJS cannot
> reliably parse a raw top-level JSON array as a request body.

---

## Seed Data

Use any SQLite viewer or the realtime sync endpoint:

```bash
curl -X POST http://localhost:3000/sync/realtime \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"EMP001","locationId":"LOC01","days":10}'
```

---

## Run Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

---

## Test Flow

1. Seed balance via `POST /sync/realtime`
2. Check balance via `GET /balances/EMP001/LOC01`
3. Request leave via `POST /timeoff/request`
4. Verify balance deducted
5. Cancel request via `POST /timeoff/1/cancel`
6. Verify balance restored
7. Try cancelling again → expect 400 (double-cancel protection)
8. Batch sync via `POST /sync/batch`
# readyon-timeoff-sync-service
