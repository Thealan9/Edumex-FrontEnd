import { TestBed } from '@angular/core/testing';

import { AdminBooks } from './admin-books';

describe('AdminBooks', () => {
  let service: AdminBooks;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminBooks);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
