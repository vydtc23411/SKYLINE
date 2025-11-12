import { Component, ViewChild, ElementRef, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from '../services/booking.service';

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

  paymentMethod = signal<'credit' | 'google' | 'apple' | 'paypal'>('credit');
  nameOnCard = signal<string>('');
  cardNumber = signal<string>('');
  expiry = signal<string>('');
  cvv = signal<string>('');
  couponCode = signal<string>('');

  @ViewChild('cardNameInput') cardNameInput!: ElementRef<HTMLInputElement>;

  // computed tổng tiền
  totalPrice = computed(() => this.flight()?.price ?? 0);

  constructor() {
    const data = this.bookingService.getAllData();

    // Nếu chưa chọn chuyến bay/ghế → quay lại chọn chuyến
    if (!data.flight || !data.seat) {
      this.router.navigate(['/chon-chuyen-bay']);
    } else {
      this.flight.set(data.flight);
      this.seat.set(data.seat);
    }
  }

  // ======== ACTIONS =========
  focusCardName(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked && this.cardNameInput) {
      this.cardNameInput.nativeElement.focus();
    }
  }

  selectMethod(method: 'credit' | 'google' | 'apple' | 'paypal') {
    this.paymentMethod.set(method);
  }

  backToSeatSelection() {
    window.history.back();
  }

  applyCoupon() {
    console.log('Mã giảm giá:', this.couponCode());
    // TODO: logic áp dụng coupon
  }

  confirmPayment(form: NgForm) {
    if (form.valid) {
      console.log('Thanh toán:', {
        flight: this.flight(),
        seat: this.seat(),
        paymentMethod: this.paymentMethod(),
        nameOnCard: this.nameOnCard(),
        cardNumber: this.cardNumber(),
        expiry: this.expiry(),
        cvv: this.cvv(),
      });

      // Lưu dữ liệu nếu cần
      this.bookingService.setData('payment', {
        paymentMethod: this.paymentMethod(),
        nameOnCard: this.nameOnCard(),
        cardNumber: this.cardNumber(),
        expiry: this.expiry(),
        cvv: this.cvv(),
      });

      this.router.navigate(['/checkout']);
    } else {
      alert('Vui lòng điền đầy đủ thông tin thanh toán.');
    }
  }

  // ======== HELPERS =========
  timeHM(iso?: string) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '';
    }
  }

  durationStr(mins?: number) {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h ? `${h}h${m}m` : `${m}m`;
  }

  timeRangeText(flight: any) {
    return flight ? `${this.timeHM(flight.departTime)} – ${this.timeHM(flight.arriveTime)} (${this.durationStr(flight.durationMin)})` : '';
  }

  priceStr(value?: number, currency: 'VND' | 'USD' = 'VND') {
    if (value == null) return '';
    return currency === 'VND'
      ? `${value.toLocaleString('vi-VN')} đ`
      : `$${value.toFixed(2)}`;
  }
}
