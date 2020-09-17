import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TileImageComponent } from './tile-image.component';

describe('TileImageComponent', () => {
  let component: TileImageComponent;
  let fixture: ComponentFixture<TileImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TileImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TileImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
