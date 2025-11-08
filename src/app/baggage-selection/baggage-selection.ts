import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // ✅ Import Router

@Component({
  selector: 'app-baggage-selection',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './baggage-selection.html',
  styleUrls: ['./baggage-selection.css']
})
export class BaggageSelection implements OnInit {

  passengerForm: FormGroup;
  baggageQuantity: number = 1;

  selectedFlight = {
    name: 'Hà Nội (HAN) - TP. Hồ Chí Minh (SGN)',
    date: 'Thứ Sáu, 07/11/2025'
  };

  constructor(private fb: FormBuilder, private router: Router) { // ✅ Inject Router
    this.passengerForm = this.fb.group({
      salutation: ['Quý Ông', Validators.required],
      fullName: ['', Validators.required],
      dob: ['', Validators.required],
      idNumber: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

  decrementBaggage(): void {
    if (this.baggageQuantity > 1) {
      this.baggageQuantity--;
    }
  }

  incrementBaggage(): void {
    this.baggageQuantity++;
  }

  // ✅ Hàm submit form → chuyển sang trang xác nhận
  onSubmit(): void {
    if (this.passengerForm.valid) {
      console.log('Form Data:', this.passengerForm.value);
      console.log('Baggage Quantity:', this.baggageQuantity);
      // alert('Đã gửi thông tin thành công!'); // có thể dùng alert nếu muốn
      this.router.navigate(['/confirmation']); // ✅ Điều hướng sang confirmation
    } else {
      this.passengerForm.markAllAsTouched();
      console.error('Form không hợp lệ.');
    }
  }

  // ✅ Hàm quay lại trang chọn ghế
  quayLai(): void {
    this.router.navigate(['/seat-selection']);
  }
}
