import { TestBed } from '@angular/core/testing';

import { AdminReports } from './admin-reports';

describe('AdminReports', () => {
  let service: AdminReports;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminReports);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
