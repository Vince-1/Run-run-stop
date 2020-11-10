import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoundingboxPointSourceComponent } from './boundingbox-point-source.component';

describe('BoundingboxPointSourceComponent', () => {
  let component: BoundingboxPointSourceComponent;
  let fixture: ComponentFixture<BoundingboxPointSourceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoundingboxPointSourceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoundingboxPointSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
