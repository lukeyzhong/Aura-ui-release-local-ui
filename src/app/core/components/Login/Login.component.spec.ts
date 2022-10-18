/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoginComponent } from './Login.component';
import { RouterTestingModule } from '@angular/router/testing';
import { SocialLoginModule, SocialAuthServiceConfig, GoogleLoginProvider } from 'angularx-social-login';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [LoginComponent],
        providers: [{
          provide: 'SocialAuthServiceConfig',
          useValue: {
            autoLogin: false,
            providers: [
              {
                id: GoogleLoginProvider.PROVIDER_ID,
                provider: new GoogleLoginProvider(
                  'clientId'
                )
              },
            ]
          } as SocialAuthServiceConfig,
        }],
        imports: [RouterTestingModule, HttpClientTestingModule, SocialLoginModule, MatSnackBarModule],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should have div tag with class name as login-bg', () => {
    const divElement = fixture.nativeElement.querySelector('div');
    expect(divElement.className).toContain('login-bg');
  });
  it('should have img tag with class name as logo', () => {
    const imgElement = fixture.nativeElement.querySelector('img');
    expect(imgElement.className).toContain('logo');
  });
  it('should have img tag with width value as 120px', () => {
    const imgElement = fixture.nativeElement.querySelector('img');
    expect(imgElement.width).toBe(120);
  });
});
