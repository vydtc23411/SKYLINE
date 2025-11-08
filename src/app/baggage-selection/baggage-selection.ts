import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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

  constructor(private fb: FormBuilder, private router: Router) {
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

  get f() {
    return this.passengerForm.controls;
  }

  decrementBaggage(): void {
    if (this.baggageQuantity > 1) {
      this.baggageQuantity--;
    }
  }

  incrementBaggage(): void {
    this.baggageQuantity++;
  }

  onSubmit(): void {
    if (this.passengerForm.valid) {
      console.log('Form Data:', this.passengerForm.value);
      console.log('Baggage Quantity:', this.baggageQuantity);
      this.router.navigate(['/confirmation']);
    } else {
      this.passengerForm.markAllAsTouched();
      console.error('Form không hợp lệ.');
    }
  }

  quayLai(): void {
    this.router.navigate(['/seat-selection']);
  }
}