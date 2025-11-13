import { Component, ViewChild, ElementRef, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from '../services/booking.service';

const TAX_RATE = 0.1; // 10% thuế và phí

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirmation.html',
  styleUrls: ['./confirmation.css'],
})
export class Confirmation {
  private bookingService = inject(BookingService);
  private router = inject(Router);

  // Signals
  flight = signal<any>(null);
  seat = signal<string>('');
  seatType = signal<string>('');
  baggageFee = signal<number>(0); // chỉ giữ phí hành lý

  paymentMethod = signal<'credit' | 'google' | 'apple' | 'paypal'>('credit');
  nameOnCard = signal<string>('');
  cardNumber = signal<string>('');
  expiry = signal<string>('');
  cvv = signal<string>('');
  couponCode = signal<string>('');

  // Popup signals
  showPaymentAlert = signal(false);
  couponApplied = signal(false);
  showCouponAlert = signal<{ show: boolean; message: string }>({ show: false, message: '' });

  @ViewChild('cardNameInput') cardNameInput!: ElementRef<HTMLInputElement>;

  // Computed giá
  basePrice = computed(() => this.flight()?.price ?? 0);
  taxesAndFees = computed(() => this.basePrice() * TAX_RATE);
  totalPrice = computed(() => this.basePrice() + this.taxesAndFees() + this.baggageFee());

  constructor() {
    const data = this.bookingService.getAllData();

    if (!data.flight || !data.seat) {
      this.router.navigate(['/chon-chuyen-bay']);
    } else {
      this.flight.set({ ...data.flight });
      this.seat.set(data.selectedSeat);
      this.seatType.set(data.selectedSeatType ?? 'Standard');

      // Chỉ lấy giá hành lý nếu đã chọn
      const baggagePrice = this.bookingService.getData('baggagePrice') ?? 0;
      this.baggageFee.set(baggagePrice);
    }
  }

  flightName() { return this.flight()?.airline ?? ''; }
  flightPrice() { return this.basePrice(); }

  flightTime() {
    try {
      const d = new Date(this.flight()?.departTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
      const a = new Date(this.flight()?.arriveTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
      return `${d} – ${a}`;
    } catch { return 'N/A'; }
  }

  getTaxes() { return this.taxesAndFees(); }

  confirmPayment(form: NgForm) {
    if (!form.valid) { this.showPaymentAlert.set(true); return; }

    this.bookingService.setData('payment', {
      method: this.paymentMethod(),
      details: form.value
    });

    this.bookingService.setData('totalAmount', this.totalPrice());
    this.bookingService.setData('bookingDate', new Date().toISOString());

    const flightNo = this.flight()?.flightNo ?? 'BK';
    const randomCode = Date.now().toString().slice(-6);
    const tempTicketCode = `${flightNo}-${randomCode}`;
    this.bookingService.setData('ticketCode', tempTicketCode);

    this.router.navigate(['/checkout']);
  }

  closeAlert() { this.showPaymentAlert.set(false); }

  applyCoupon() {
    if (this.couponApplied()) {
      this.showCouponAlert.set({ show: true, message: 'Bạn đã áp dụng mã giảm giá rồi.' });
      this.autoHideCouponAlert(); return;
    }

    const code = this.couponCode();
    if (!code) {
      this.showCouponAlert.set({ show: true, message: 'Vui lòng nhập mã giảm giá.' });
      this.autoHideCouponAlert(); return;
    }

    if (code === 'DISCOUNT10') {
      const oldPrice = this.flight()?.price ?? 0;
      if (!this.flight()?.originalPrice) {
        this.flight.update(f => f ? { ...f, originalPrice: oldPrice } : f);
      }
      const newPrice = oldPrice * 0.9;
      this.flight.update(f => f ? { ...f, price: newPrice } : f);

      this.couponApplied.set(true);
      this.showCouponAlert.set({ show: true, message: `Mã giảm giá áp dụng thành công! Giá sau voucher: ${newPrice}` });
    } else {
      this.showCouponAlert.set({ show: true, message: 'Mã giảm giá không hợp lệ.' });
    }

    this.autoHideCouponAlert();
  }

  private autoHideCouponAlert() {
    setTimeout(() => { this.showCouponAlert.set({ show: false, message: '' }); }, 3000);
  }

  backToBaggageSelection() {
    const f = this.flight();
    const flightId = f?.id;
  
    if (flightId) {
      this.router.navigate(['/baggage-selection', flightId]);
    } else {
      this.router.navigate(['/baggage-selection']);
    }
  }
  
  focusCardName(event: Event) { this.cardNameInput?.nativeElement?.focus(); }
  selectMethod(method: 'credit' | 'google' | 'apple' | 'paypal') { this.paymentMethod.set(method); }
}
