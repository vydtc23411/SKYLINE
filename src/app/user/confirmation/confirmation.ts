import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirmation.html',
  styleUrls: ['./confirmation.css'],
})
export class Confirmation {
  paymentMethod: 'credit' | 'google' | 'apple' | 'paypal' = 'credit';


  nameOnCard = '';
  cardNumber = '';
  expiry = '';
  cvv = '';
  couponCode = '';


  @ViewChild('cardNameInput') cardNameInput!: ElementRef<HTMLInputElement>;


  constructor(private router: Router) {}


  // ✅ Chọn phương thức thanh toán
  selectMethod(method: 'credit' | 'google' | 'apple' | 'paypal') {
    this.paymentMethod = method;
  }


  // ✅ Áp dụng mã giảm giá (giả lập)
  applyCoupon() {
    alert('Mã giảm giá đã được áp dụng (giả lập).');
  }


  // ✅ Xác nhận thanh toán — hiển thị lỗi nếu form chưa hợp lệ
  confirmPayment(form: NgForm) {
    if (form.invalid) {
      Object.values(form.controls).forEach(control => {
        control.markAsTouched();
        control.markAsDirty();
      });
      return;
    }
    this.router.navigate(['/checkout']);
  }


  // ✅ Quay lại trang chọn chỗ ngồi
  backToSeatSelection() {
    this.router.navigate(['/baggage-selection']);
  }


  // ✅ Focus vào input tên thẻ khi chọn checkbox
  focusCardName(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked && this.cardNameInput) {
      this.cardNameInput.nativeElement.focus();
    }
  }
}



