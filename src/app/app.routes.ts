import { Routes } from '@angular/router';

// Layout & pages
import { MainLayout } from './main-layout/main-layout';
import { Information } from './information/information';
import { Rewards } from './rewards/rewards';
import { Notifications } from './notifications/notifications';
import { CheckTicket } from './checkticket/checkticket';
import { CheckTicket2 } from './checkticket2/checkticket2';
import { Confirmation } from './confirmation/confirmation';

// Booking pages
import { SeatSelection } from './seat-selection/seat-selection';
import { BaggageSelection } from './baggage-selection/baggage-selection';
import { Checkout } from './checkout/checkout';

export const routes: Routes = [
  // Trang mặc định khi vào app
  { path: '', redirectTo: 'customer-sign-in', pathMatch: 'full' },

  // Đăng nhập/đăng ký
  {
    path: 'customer-sign-in',
    loadComponent: () => import('./customer-sign-in/customer-sign-in').then(m => m.CustomerSignInComponent)
  },
  {
    path: 'customer-sign-up',
    loadComponent: () => import('./customer-sign-up/customer-sign-up').then(m => m.CustomerSignUpComponent)
  },

  // Trang chính
  {
    path: 'home',
    loadComponent: () => import('./home/home').then(m => m.HomeComponent)
  },

  {
    path: 'promotion',
    loadComponent: () => import('./promotion/promotion').then(m => m.Promotion)
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
<<<<<<< HEAD
      { path: '', redirectTo: 'checkticket', pathMatch: 'full' }, 
      { path: 'contact', component: Contact }, 
      { path: '', redirectTo: 'checkticket', pathMatch: 'full' },
=======
      { path: '', redirectTo: 'information', pathMatch: 'full' }, // default child
>>>>>>> a8af3483ea41390ba031ec3dabd87abf9a68e446
    ]
  },

  // Trang đặt vé / chuyến bay
  { path: 'seat-selection', component: SeatSelection },
  { path: 'baggage-selection', component: BaggageSelection },
  { path: 'checkout', component: Checkout },

  // Trang xác nhận
  { path: 'confirmation', component: Confirmation },
];
