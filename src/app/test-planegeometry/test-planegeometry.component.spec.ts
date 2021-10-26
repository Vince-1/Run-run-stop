import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestPlanegeometryComponent } from './test-planegeometry.component';

describe('TestPlanegeometryComponent', () => {
  let component: TestPlanegeometryComponent;
  let fixture: ComponentFixture<TestPlanegeometryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestPlanegeometryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestPlanegeometryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
