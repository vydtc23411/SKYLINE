import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

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
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './checkticket.html',
  styleUrls: ['./checkticket.css']
})
export class CheckTicket implements OnInit {
  searchText: string = '';
  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    // Load data từ JSON
    this.http.get<Ticket[]>('assets/data/example_ticket.json').subscribe({
      next: (data) => {
        this.tickets = data;
        this.filteredTickets = [...this.tickets];
      },
      error: (err) => {
        console.error('Lỗi khi đọc file JSON:', err);
        this.tickets = [];
        this.filteredTickets = [];
      }
    });
  }

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
