import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShaderColorpickerGpuComponent } from './shader-colorpicker-gpu.component';

describe('ShaderColorpickerGpuComponent', () => {
  let component: ShaderColorpickerGpuComponent;
  let fixture: ComponentFixture<ShaderColorpickerGpuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShaderColorpickerGpuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShaderColorpickerGpuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
