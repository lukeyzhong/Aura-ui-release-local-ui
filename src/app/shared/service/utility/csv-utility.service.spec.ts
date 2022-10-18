import { TestBed } from '@angular/core/testing';

import { CsvUtilityService } from './csv-utility.service';

describe('CsvUtilityService', () => {
  let service: CsvUtilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CsvUtilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
