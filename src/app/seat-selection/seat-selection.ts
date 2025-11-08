import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seat-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-selection.html',
  styleUrls: ['./seat-selection.css']
})
export class SeatSelection {

  selectedSeat: string | null = null;
  selectedSeatType: string | null = null;

  constructor(private router: Router) { }

  // ✅ Hàm chọn ghế
  selectSeat(seatId: string, seatType: string) {
    console.log('Ghế đã chọn:', seatId, 'Loại:', seatType);

    if (this.selectedSeat === seatId) {
      // Nếu bấm lại cùng ghế → bỏ chọn
      this.selectedSeat = null;
      this.selectedSeatType = null;
    } else {
      this.selectedSeat = seatId;
      this.selectedSeatType = seatType;
    }
  }

  // ✅ Hàm nhấn "Tiếp tục"
  tiepTuc() {
    if (!this.selectedSeat) {
      alert('⚠️ Vui lòng chọn ghế trước khi tiếp tục!');
      return;
    }
    this.router.navigate(['/baggage-selection']);
  }

  // ✅ Hàm nhấn "Quay lại"
  quayLai() {
    this.router.navigate(['/flight-selection']);
  }

}
