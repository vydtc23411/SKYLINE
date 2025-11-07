import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent implements OnInit {
  userName: string = 'Tài khoản';
  isLoggedIn: boolean = false;
  showDropdown: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Get current user name
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userName = currentUser.name;
      this.isLoggedIn = true;
    }
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdownManually(): void {
    this.showDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.showDropdown = false;
    }
  }

  logout(): void {
    this.authService.logout();
    localStorage.removeItem('fullUserData'); // Xóa thêm dữ liệu user đầy đủ
    this.isLoggedIn = false;
    this.userName = 'Tài khoản';
    this.showDropdown = false;
    this.router.navigate(['/customer-sign-in']);
  }

  navigateToInformation(event: MouseEvent): void {
    event.stopPropagation(); // chặn click lan ra ngoài
    this.showDropdown = false; // đóng menu
    this.router.navigate(['/information']); // điều hướng Angular
  }
  
}
