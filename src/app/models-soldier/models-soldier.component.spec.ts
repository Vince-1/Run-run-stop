import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelsSoldierComponent } from './models-soldier.component';

describe('ModelsSoldierComponent', () => {
  let component: ModelsSoldierComponent;
  let fixture: ComponentFixture<ModelsSoldierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModelsSoldierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelsSoldierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
