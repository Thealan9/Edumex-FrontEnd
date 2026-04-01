import { TestBed } from '@angular/core/testing';

import { AdminTickets } from './admin-tickets';

describe('AdminTickets', () => {
  let service: AdminTickets;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminTickets);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
