import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadCrumbBarComponent } from './bread-crumb-bar.component';

describe('BreadCrumbBarComponent', () => {
  let component: BreadCrumbBarComponent;
  let fixture: ComponentFixture<BreadCrumbBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BreadCrumbBarComponent],
      imports: [RouterTestingModule],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BreadCrumbBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
