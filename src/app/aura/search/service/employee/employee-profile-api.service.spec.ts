import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { EmployeeProfileApiService } from './employee-profile-api.service';

describe('EmployeeProfileApiService', () => {
  let service: EmployeeProfileApiService;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
  }));

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeProfileApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
