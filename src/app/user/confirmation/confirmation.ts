import { Component, ViewChild, ElementRef, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from '../services/booking.service';

const TAX_RATE = 0.10;

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

  flight = signal<any>(null);
  seat = signal<string>('');
  seatType = signal<string>('');
  baggageCount = signal<number>(0);

  paymentMethod = signal<'credit' | 'google' | 'apple' | 'paypal'>('credit');
  nameOnCard = signal<string>('');
  cardNumber = signal<string>('');
  expiry = signal<string>('');
  cvv = signal<string>('');
  couponCode = signal<string>('');

  showPaymentAlert = signal(false);

  @ViewChild('cardNameInput') cardNameInput!: ElementRef<HTMLInputElement>;

  basePrice = computed(() => this.flight()?.price ?? 0);

  // TÍNH THUẾ (10% trên giá vé)
  taxesAndFees = computed(() => {
    return this.basePrice() * TAX_RATE;
  });

  // TỔNG TIỀN CUỐI CÙNG (Giá vé + Thuế)
  totalPrice = computed(() => {
    return this.basePrice() + this.taxesAndFees();
  });

  constructor() {
    const data = this.bookingService.getAllData();

    if (!data.selectedFlight || !data.selectedSeat) {
      console.warn('Không tìm thấy selectedFlight hoặc selectedSeat, điều hướng...');
      this.router.navigate(['/tim-chuyen-bay']);
    } else {
      this.flight.set(data.selectedFlight);
      this.seat.set(data.selectedSeat);
      this.seatType.set(data.selectedSeatType ?? 'Standard');
      this.baggageCount.set(data.baggage ?? 0);
    }
  }

  flightName() {
    return this.flight()?.airline ?? '';
  }

  flightPrice() {
    return this.basePrice();
  }

  flightTime() {
    try {
      const d = new Date(this.flight()?.departTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
      const a = new Date(this.flight()?.arriveTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
      return `${d} – ${a}`;
    } catch { return 'N/A'; }
  }

  getTaxes() { return this.taxesAndFees(); }

  confirmPayment(form: NgForm) {
    if (!form.valid) {
      this.showPaymentAlert.set(true);
      return;
    }

    console.log('Thanh toán được xác nhận');
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


  closeAlert() {
    this.showPaymentAlert.set(false);
  }

  applyCoupon() {
    const code = this.couponCode();
    if (!code) {
      alert('Vui lòng nhập mã giảm giá.');
      return;
    }

    if (code === 'DISCOUNT10') {
      const oldPrice = this.flight()?.price ?? 0;
      if (this.flight()?.originalPrice) {
        alert('Bạn đã áp dụng mã giảm giá rồi.');
        return;
      }
      const newPrice = oldPrice * 0.9;
      this.flight.update(f => f ? { ...f, price: newPrice, originalPrice: oldPrice } : f);
      alert('Mã giảm giá áp dụng thành công!');
    } else {
      alert('Mã giảm giá không hợp lệ.');
    }
  }

  backToSeatSelection() {
    const flightId = this.flight()?.id;
    if (flightId) {
      this.router.navigate(['/seat-selection', flightId]);
    } else {
      this.router.navigate(['/tim-chuyen-bay']);
    }
  }

  focusCardName(event: Event) {
    this.cardNameInput?.nativeElement?.focus();
  }

  selectMethod(method: 'credit' | 'google' | 'apple' | 'paypal') {
    this.paymentMethod.set(method);
  }
}