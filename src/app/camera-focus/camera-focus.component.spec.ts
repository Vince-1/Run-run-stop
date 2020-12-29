import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraFocusComponent } from './camera-focus.component';

describe('CameraFocusComponent', () => {
  let component: CameraFocusComponent;
  let fixture: ComponentFixture<CameraFocusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CameraFocusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CameraFocusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
