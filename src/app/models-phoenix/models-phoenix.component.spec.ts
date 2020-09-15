import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelsPhoenixComponent } from './models-phoenix.component';

describe('ModelsPhoenixComponent', () => {
  let component: ModelsPhoenixComponent;
  let fixture: ComponentFixture<ModelsPhoenixComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModelsPhoenixComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelsPhoenixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
