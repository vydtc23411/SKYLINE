import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-seat-selection',
  imports: [CommonModule],
  templateUrl: './seat-selection.html',
  styleUrls: ['./seat-selection.css']
})
export class SeatSelection {

  selectedSeat: string | null = null;
  selectedSeatType: string | null = null;

  constructor() { }

  selectSeat(seatId: string, seatType: string) {
    console.log('Ghế đã chọn:', seatId, 'Loại:', seatType);

    if (this.selectedSeat === seatId) {
      this.selectedSeat = null;
      this.selectedSeatType = null;
    } else {
      this.selectedSeat = seatId;
      this.selectedSeatType = seatType;
    }
  }
}