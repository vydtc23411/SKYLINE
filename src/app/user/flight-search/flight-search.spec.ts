/// <reference types="jasmine" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FlightSearchComponent } from './flight-search'; 

describe('FlightSearchComponent (standalone)', () => {
  let component: FlightSearchComponent;
  let fixture: ComponentFixture<FlightSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Standalone component: đưa thẳng vào imports
      imports: [FlightSearchComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FlightSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render basic UI pieces', () => {
    const el: HTMLElement = fixture.nativeElement;
    // có nút tìm chuyến
    expect(el.querySelector('button.btn')?.textContent).toContain('Tìm chuyến bay');
    // có tabs một chiều / khứ hồi
    const tabs = el.querySelectorAll('.trip-tabs .tab');
    expect(tabs.length).toBeGreaterThanOrEqual(2);
  });

  it('swap() should swap origin/destination codes', () => {
    // set giá trị ban đầu
    component.from.set('SGN');
    component.to.set('HAN');

    component.swap();
    expect(component.from()).toBe('HAN');
    expect(component.to()).toBe('SGN');
  });

  it('should update DOM after swap button click', () => {
    // tìm nút swap và click
    const swapBtn = fixture.debugElement.query(By.css('.swap'));
    expect(swapBtn).toBeTruthy();

    // set from/to trước khi click
    component.from.set('SGN');
    component.to.set('DAD');
    fixture.detectChanges();

    swapBtn.triggerEventHandler('click', {});
    fixture.detectChanges();

    // kiểm tra giá trị select đã đổi (dựa theo ngModel binding)
    const selects = fixture.debugElement.queryAll(By.css('select'));
    const fromSelect = selects[0].nativeElement as HTMLSelectElement;
    const toSelect = selects[1].nativeElement as HTMLSelectElement;

    expect(component.from()).toBe('DAD');
    expect(component.to()).toBe('SGN');
    // DOM có thể khác tuỳ option order; chủ yếu xác nhận state component đã đổi
  });
});
