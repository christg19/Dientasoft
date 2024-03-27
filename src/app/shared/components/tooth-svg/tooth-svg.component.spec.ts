import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToothSVGComponent } from './tooth-svg.component';

describe('ToothSVGComponent', () => {
  let component: ToothSVGComponent;
  let fixture: ComponentFixture<ToothSVGComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ToothSVGComponent]
    });
    fixture = TestBed.createComponent(ToothSVGComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
