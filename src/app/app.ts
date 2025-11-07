import { Component, signal } from '@angular/core';
import { Routes } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Confirmation } from './confirmation/confirmation';
import { CheckTicket } from './checkticket/checkticket';
import { CheckTicket2 } from './checkticket2/checkticket2';  // Đường dẫn chuẩn đúng file
import { SeatSelection } from './seat-selection/seat-selection';
import { BaggageSelection } from './baggage-selection/baggage-selection';
import { Checkout } from './checkout/checkout';
import { Sidebar } from './sidebar/sidebar';
import { Information } from './information/information';
import { Promotion } from './promotion/promotion';
import { Rewards } from './rewards/rewards';
import { Notifications } from './notifications/notifications';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    CommonModule, // 👈 thêm dòng này để có ngIf, ngFor, ngClass
    FormsModule,
    SeatSelection, 
    BaggageSelection, 
    Checkout,
    Sidebar,
    Confirmation,
    Information,
    Promotion,
    Rewards,
    Notifications
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('skyline');
}

export const routes: Routes = [
  { path: '', redirectTo: 'checkticket', pathMatch: 'full' },
  { path: 'checkticket', component: CheckTicket },
  { path: 'checkticket2', component: CheckTicket2 }
];
