import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConwayLifeGameComponent } from './conway-life-game.component';

describe('ConwayLifeGameComponent', () => {
  let component: ConwayLifeGameComponent;
  let fixture: ComponentFixture<ConwayLifeGameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConwayLifeGameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConwayLifeGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
