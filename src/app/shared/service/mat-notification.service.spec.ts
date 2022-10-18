import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { MatNotificationService } from './mat-notification.service';

describe('MatNotificationService', () => {
  let service: MatNotificationService;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [MatSnackBarModule],
  }));
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
