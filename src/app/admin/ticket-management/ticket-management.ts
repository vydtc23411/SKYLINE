import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSidebarComponent } from '../shared/sidebar/sidebar';

@Component({
  selector: 'app-ticket-management',
  imports: [CommonModule, AdminSidebarComponent],
  templateUrl: './ticket-management.html',
  styleUrl: './ticket-management.css',
})
export class TicketManagement {

}
