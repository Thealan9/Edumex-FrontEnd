import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { storeGuard } from './store-guard';

describe('storeGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => storeGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
