import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShaderDmeosComponent } from './shader-dmeos.component';

describe('ShaderDmeosComponent', () => {
  let component: ShaderDmeosComponent;
  let fixture: ComponentFixture<ShaderDmeosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShaderDmeosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShaderDmeosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
