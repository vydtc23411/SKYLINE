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

  // Signal hiển thị popup alert
  showPaymentAlert = signal(false);

  @ViewChild('cardNameInput') cardNameInput!: ElementRef<HTMLInputElement>;

  // computed tổng tiền
  totalPrice = computed(() => this.flight()?.price ?? 0);

  constructor() {
    const data = this.bookingService.getAllData();

    if (!data.flight || !data.seat) {
      // Nếu chưa có dữ liệu, quay lại chọn chuyến hoặc ghế
      this.router.navigate(['/chon-chuyen-bay']);
    } else {
      this.flight.set(data.flight);
      this.seat.set(data.seat);
    }
  }

  // Hàm helper hiển thị thông tin
  flightName() {
    return this.flight()?.airline ?? '';
  }

  flightPrice() {
    return this.flight()?.price ?? 0;
  }

  flightTime() {
    return `${this.flight()?.departTime} – ${this.flight()?.arriveTime}`;
  }
  confirmPayment(form: NgForm) {
    if (!form.valid) {
      this.showPaymentAlert.set(true); // Hiện popup nếu form chưa hợp lệ
      return;
    }
  
    // Form hợp lệ → lưu dữ liệu và chuyển trang
    console.log('Thanh toán được xác nhận với dữ liệu:', form.value);
    this.bookingService.setData('payment', {
      method: this.paymentMethod(),
      details: form.value
    });
  
    this.router.navigate(['/checkout']); // hoặc trang tiếp theo bạn muốn
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
  
    // Ví dụ đơn giản: giảm 10% nếu mã là "DISCOUNT10"
    if (code === 'DISCOUNT10') {
      const oldPrice = this.flight()?.price ?? 0;
      const newPrice = oldPrice * 0.9;
      this.flight.update(f => f ? { ...f, price: newPrice } : f);
      alert('Mã giảm giá áp dụng thành công! Giá mới: ' + newPrice);
    } else {
      alert('Mã giảm giá không hợp lệ.');
    }
  }
  backToSeatSelection() {
    // Quay lại trang chọn ghế, truyền flightId nếu có
    const flightId = this.flight()?.id;
    if (flightId) {
      this.router.navigate(['/seat-selection', flightId]);
    } else {
      this.router.navigate(['/chon-chuyen-bay']);
    }
  }
  focusCardName(event: Event) {
    // Lấy phần tử input và focus
    this.cardNameInput?.nativeElement?.focus();
  }
  selectMethod(method: 'credit' | 'google' | 'apple' | 'paypal') {
    this.paymentMethod.set(method);
  }
  
  
}