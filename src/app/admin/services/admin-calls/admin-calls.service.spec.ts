import { TestBed } from '@angular/core/testing';

import { AdminCallsService } from './admin-calls.service';

describe('AdminCallsService', () => {
  let service: AdminCallsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminCallsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
