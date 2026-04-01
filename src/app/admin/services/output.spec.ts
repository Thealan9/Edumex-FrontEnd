import { TestBed } from '@angular/core/testing';

import { Output } from './output';

describe('Output', () => {
  let service: Output;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Output);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
