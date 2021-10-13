import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingPassComponent } from './processing-pass.component';

describe('ProcessingPassComponent', () => {
  let component: ProcessingPassComponent;
  let fixture: ComponentFixture<ProcessingPassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessingPassComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingPassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
