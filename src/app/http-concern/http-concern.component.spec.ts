import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpConcernComponent } from './http-concern.component';

describe('HttpConcernComponent', () => {
  let component: HttpConcernComponent;
  let fixture: ComponentFixture<HttpConcernComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HttpConcernComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HttpConcernComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
