import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ModuleNavigationService } from './module-navigation.service';

describe('ModuleNavigationService', () => {
  let service: ModuleNavigationService;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
  }));

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModuleNavigationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
