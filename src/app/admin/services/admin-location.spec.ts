import { TestBed } from '@angular/core/testing';

import { AdminLocation } from './admin-location';

describe('AdminLocation', () => {
  let service: AdminLocation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminLocation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
