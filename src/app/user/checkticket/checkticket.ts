import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface Ticket {
  code: string;
  name: string;
  seat: string;
  status: string;
  route: string;
}

@Component({
  selector: 'app-checkticket',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkticket.html',
  styleUrls: ['./checkticket.css']
})
export class CheckTicket {
  searchText: string = '';

  tickets: Ticket[] = [
    { code: 'TRPM01', name: 'Nguyễn Văn A', seat: 'A15', status: 'Đã thanh toán', route: 'Hà Nội - HCM' },
    { code: 'TRPM02', name: 'Nguyễn Văn A', seat: 'A16', status: 'Chờ thanh toán', route: 'Hà Nội - Đà Nẵng' }
  ];

  filteredTickets: Ticket[] = [...this.tickets];

  constructor(private router: Router) {}

  goToDetail(ticket: Ticket) {
    this.router.navigate(['/checkticket2'], { queryParams: { code: ticket.code } });
  }

  searchTicket() {
    const text = this.searchText.trim().toLowerCase();
    if (!text) {
      this.filteredTickets = [...this.tickets];
    } else {
      this.filteredTickets = this.tickets.filter(
        t => t.code.toLowerCase().includes(text) || t.seat.toLowerCase().includes(text)
      );
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
