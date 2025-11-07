import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirmation.html',
  styleUrl: './confirmation.css',
})
export class Confirmation {
  paymentMethod = 'credit';
  nameOnCard = '';
  cardNumber = '';
  expiry = '';
  cvv = '';
  couponCode = '';

  constructor(private router: Router) {}

  selectMethod(method: string) {
    this.paymentMethod = method;
  }

  applyCoupon() {
    alert('Mã giảm giá đã được áp dụng (giả lập).');
  }

  confirmPayment() {
    // TODO: điều hướng sang trang xác nhận sau khi thanh toán
    alert('Thanh toán thành công (giả lập).');
    // this.router.navigate(['/thank-you']);
  }

  backToSeatSelection() {
    // TODO: điều hướng về trang chọn chỗ ngồi
    this.router.navigate(['/seat-selection']);
  }

  @ViewChild('cardNameInput') cardNameInput!: ElementRef<HTMLInputElement>;

focusCardName(event: Event) {
  const checkbox = event.target as HTMLInputElement;
  if (checkbox.checked && this.cardNameInput) {
    this.cardNameInput.nativeElement.focus();
  }
}


}
