import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { GlobalSearchApiService } from './global-search-api.service';

describe('GlobalSearchApiService', () => {
  let service: GlobalSearchApiService;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
  }));

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalSearchApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
