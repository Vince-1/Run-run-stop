import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SigleCanvasComponent } from './sigle-canvas.component';

describe('SigleCanvasComponent', () => {
  let component: SigleCanvasComponent;
  let fixture: ComponentFixture<SigleCanvasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SigleCanvasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SigleCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
