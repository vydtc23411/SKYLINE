import { Routes } from '@angular/router';
import { Information } from './information/information';
import { Rewards } from './rewards/rewards'; 
import { Confirmation } from './confirmation/confirmation';
import { CheckTicket } from './checkticket/checkticket'; 
import { CheckTicket2 } from './checkticket2/checkticket2';
import { MainLayout } from './main-layout/main-layout';
import { Notifications } from './notifications/notifications';
import { Contact } from './contact/contact';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'customer-sign-in',
    pathMatch: 'full'
  },
  {
    path: 'customer-sign-in',
    loadComponent: () => import('./customer-sign-in/customer-sign-in').then(m => m.CustomerSignInComponent)
  },
  {
    path: 'customer-sign-up',
    loadComponent: () => import('./customer-sign-up/customer-sign-up').then(m => m.CustomerSignUpComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home').then(m => m.HomeComponent)
  },
  {
    path: 'promotion', // 
    loadComponent: () => import('./promotion/promotion').then(m => m.Promotion)
  },
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'information', component: Information },
      { path: 'rewards', component: Rewards },
      { path: 'notifications', component: Notifications },
      { path: '', redirectTo: 'information', pathMatch: 'full' },
      { path: 'checkticket', component: CheckTicket },
      { path: 'checkticket2', component: CheckTicket2 },
      { path: '', redirectTo: 'checkticket', pathMatch: 'full' }, 
      { path: 'contact', component: Contact }, 
      { path: '', redirectTo: 'checkticket', pathMatch: 'full' },
    ]
  },
  { path: 'confirmation', component: Confirmation },
];
