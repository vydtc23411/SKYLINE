import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    QRCodeComponent
  ],

  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})

export class Checkout implements OnInit {

  paymentDeadline = new Date('2025-01-01T06:00:00');

  ticketInfo: any = {};
  qrData: string = '';
  totalAmount: number = 0;
  isLoading: boolean = true;

  private bookingId = 'BK-12345';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchTicketData();
  }

  fetchTicketData(): void {
    this.isLoading = true;

    setTimeout(() => {
      const apiResponse: any = {
        ticketCode: 'VN-FLIGHT-98765',
        passenger: {
          name: 'Nguyễn Văn A',
          phone: '0912345678',
          email: 'nguyenvana@gmail.com'
        },
        bookingDate: '2025-01-01T00:00:00',
        totalPrice: 1500000
      };

      this.ticketInfo = {
        name: apiResponse.passenger.name,
        phone: apiResponse.passenger.phone,
        bookingDate: new Date(apiResponse.bookingDate),
        email: apiResponse.passenger.email
      };
      this.totalAmount = apiResponse.totalPrice;

      this.qrData = apiResponse.ticketCode;

      this.isLoading = false;
    }, 1000);
  }
}