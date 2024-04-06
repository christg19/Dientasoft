import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalContent1Component } from './modal-content1.component';

describe('ModalContent1Component', () => {
  let component: ModalContent1Component;
  let fixture: ComponentFixture<ModalContent1Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalContent1Component]
    });
    fixture = TestBed.createComponent(ModalContent1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
