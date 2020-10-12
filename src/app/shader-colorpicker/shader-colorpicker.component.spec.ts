import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShaderColorpickerComponent } from './shader-colorpicker.component';

describe('ShaderColorpickerComponent', () => {
  let component: ShaderColorpickerComponent;
  let fixture: ComponentFixture<ShaderColorpickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShaderColorpickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShaderColorpickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
