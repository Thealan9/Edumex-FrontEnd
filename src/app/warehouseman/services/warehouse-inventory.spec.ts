import { TestBed } from '@angular/core/testing';

import { WarehouseInventory } from './warehouse-inventory';

describe('WarehouseInventory', () => {
  let service: WarehouseInventory;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WarehouseInventory);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
