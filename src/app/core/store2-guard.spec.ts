import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { store2Guard } from './store2-guard';

describe('store2Guard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => store2Guard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
