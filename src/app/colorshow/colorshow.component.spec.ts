import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorshowComponent } from './colorshow.component';

describe('ColorshowComponent', () => {
  let component: ColorshowComponent;
  let fixture: ComponentFixture<ColorshowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColorshowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorshowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
