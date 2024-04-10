import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuesComponent } from './dues.component';

describe('DuesComponent', () => {
  let component: DuesComponent;
  let fixture: ComponentFixture<DuesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DuesComponent]
    });
    fixture = TestBed.createComponent(DuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
