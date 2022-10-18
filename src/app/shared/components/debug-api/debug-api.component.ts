import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-debug-api',
  templateUrl: './debug-api.component.html',
  styleUrls: ['./debug-api.component.scss'],
})
export class DebugApiComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}

  changeEndPoint(envType: string): void {
    switch (envType) {
      case 'local':
        environment.apiBaseUrl = 'https://localhost:44357/api';
        break;
      case 'dev':
        environment.apiBaseUrl = 'https://dev.antra.com/aura/api';
        break;
      case 'test':
        environment.apiBaseUrl = 'https://auratest.antra.com/aura/api';
        break;
    }
    localStorage.setItem('apiTestUrl', environment.apiBaseUrl);
    this.router.navigate(['/login']);
  }
}
