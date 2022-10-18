import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { GlobalSearchResultAllComponent } from './global-search-result-all.component';

describe('GlobalSearchResultAllComponent', () => {
  let component: GlobalSearchResultAllComponent;
  let fixture: ComponentFixture<GlobalSearchResultAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GlobalSearchResultAllComponent],
      imports: [RouterModule.forRoot([]), HttpClientTestingModule],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalSearchResultAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
