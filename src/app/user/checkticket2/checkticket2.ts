// checkticket2.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// Định nghĩa lại interface Ticket (nên dùng chung 1 file, nhưng ở đây tôi định nghĩa lại để tiện)
interface Ticket {
  code: string;
  name: string;
  seat: string;
  status: string;
  route: string;
  phone: string; // Thêm thông tin chi tiết
  email: string; // Thêm thông tin chi tiết
  departure: string; // Thêm thông tin chi tiết
  price: number; // Thêm thông tin chi tiết
}

@Component({
  selector: 'app-checkticket2',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './checkticket2.html',
  styleUrls: ['./checkticket2.css']
})
export class CheckTicket2 implements OnInit {
  ticketDetail: Ticket | undefined;

  // Giả lập danh sách vé chi tiết (có thể lấy từ service/API)
  tickets: Ticket[] = [
    { 
      code: 'TRPM01', 
      name: 'Nguyễn Văn A', 
      seat: 'A15', 
      status: 'Đã thanh toán', 
      route: 'Hà Nội - TP. Hồ Chí Minh', 
      phone: '0901234567', 
      email: 'nguyenvana@example.com', 
      departure: '08:00 - 2025-12-25',
      price: 1500000 
    },
    { 
      code: 'TRPM02', 
      name: 'Nguyễn Văn B', 
      seat: 'A16', 
      status: 'Chờ thanh toán', 
      route: 'Hà Nội - Đà Nẵng', 
      phone: '0907654321', 
      email: 'nguyenvanb@example.com', 
      departure: '10:30 - 2025-12-26',
      price: 1200000
    }
    // Thêm các vé khác nếu cần
  ];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Lấy 'code' từ query params
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      if (code) {
        this.ticketDetail = this.tickets.find(ticket => ticket.code === code);
      }
      
      // Chuyển hướng nếu không tìm thấy vé
      if (!this.ticketDetail) {
         // Bạn có thể chuyển hướng về trang tra cứu hoặc hiển thị thông báo lỗi
         console.error('Không tìm thấy thông tin vé với mã:', code);
         // this.router.navigate(['/checkticket']); 
      }
    });
  }

  // Hàm quay lại trang tra cứu
  goBack() {
    this.router.navigate(['/checkticket']);
  }
}