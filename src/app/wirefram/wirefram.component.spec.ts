import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WireframComponent } from './wirefram.component';

describe('WireframComponent', () => {
  let component: WireframComponent;
  let fixture: ComponentFixture<WireframComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WireframComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WireframComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
