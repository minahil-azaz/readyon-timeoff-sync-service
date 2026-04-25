/**
 * Mock HCM (Human Capital Management) system.
 * Simulates an external HCM returning employee balance data.
 * In production this would be replaced by real HTTP calls to your HCM provider.
 */

export interface HcmBalanceRecord {
  employeeId: string;
  locationId: string;
  days: number;
}

const mockDatabase: HcmBalanceRecord[] = [
  { employeeId: 'EMP001', locationId: 'LOC01', days: 10 },
  { employeeId: 'EMP002', locationId: 'LOC01', days: 5 },
  { employeeId: 'EMP003', locationId: 'LOC02', days: 8 },
];

export class MockHcmService {
  /**
   * Fetch all balances from mock HCM (used for batch sync).
   */
  async getAllBalances(): Promise<HcmBalanceRecord[]> {
    return Promise.resolve(mockDatabase);
  }

  /**
   * Fetch a single employee balance from mock HCM.
   */
  async getBalance(
    employeeId: string,
    locationId: string,
  ): Promise<HcmBalanceRecord | null> {
    const record = mockDatabase.find(
      (r) => r.employeeId === employeeId && r.locationId === locationId,
    );
    return Promise.resolve(record ?? null);
  }
}
