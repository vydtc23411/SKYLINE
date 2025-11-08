import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightSelection } from './flight-selection';

describe('FlightSelection', () => {
  let component: FlightSelection;
  let fixture: ComponentFixture<FlightSelection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightSelection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlightSelection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
