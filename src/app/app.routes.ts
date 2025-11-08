import { Routes } from '@angular/router';

// Layout & pages
import { MainLayout } from './user/main-layout/main-layout';
import { Information } from './user/information/information';
import { Rewards } from './user/rewards/rewards';
import { Notifications } from './user/notifications/notifications';
import { CheckTicket } from './user/checkticket/checkticket';
import { CheckTicket2 } from './user/checkticket2/checkticket2';
import { Confirmation } from './user/confirmation/confirmation';

// Booking pages
import { SeatSelection } from './user/seat-selection/seat-selection';
import { BaggageSelection } from './user/baggage-selection/baggage-selection';
import { Checkout } from './user/checkout/checkout';
import { Contact } from './user/contact/contact';

export const routes: Routes = [
  // Trang mặc định khi vào app
  { path: '', redirectTo: 'customer-sign-in', pathMatch: 'full' },

  // Đăng nhập/đăng ký
  {
    path: 'customer-sign-in',
    loadComponent: () => import('./user/customer-sign-in/customer-sign-in').then(m => m.CustomerSignInComponent)
  },
  {
    path: 'customer-sign-up',
    loadComponent: () => import('./user/customer-sign-up/customer-sign-up').then(m => m.CustomerSignUpComponent)
  },

  // Trang chính
  {
    path: 'home',
    loadComponent: () => import('./user/home/home').then(m => m.HomeComponent)
  },

  {
    path: 'promotion',
    loadComponent: () => import('./user/promotion/promotion').then(m => m.Promotion)
  },

  // Các trang trong layout chính
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'information', component: Information },
      { path: 'rewards', component: Rewards },
      { path: 'notifications', component: Notifications },
      { path: 'checkticket', component: CheckTicket },
      { path: 'checkticket2', component: CheckTicket2 },
      { path: '', redirectTo: 'checkticket', pathMatch: 'full' }, 
      { path: 'contact', component: Contact }, 
      { path: '', redirectTo: 'checkticket', pathMatch: 'full' },
    ]
  },

  // Trang đặt vé / chuyến bay
  { path: 'seat-selection', component: SeatSelection },
  { path: 'baggage-selection', component: BaggageSelection },
  { path: 'checkout', component: Checkout },

  // Trang xác nhận
  { path: 'confirmation', component: Confirmation },
];
