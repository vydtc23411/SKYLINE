import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
    console.log('Dropdown toggled:', this.showDropdown); // Debug log
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    const target = event.target as HTMLElement;
    const userMenu = target.closest('.user-menu');
    const dropdownMenu = target.closest('.dropdown-menu');
    
    // Nếu click outside cả user-menu và dropdown-menu
    if (!userMenu && !dropdownMenu && this.showDropdown) {
      this.showDropdown = false;
      console.log('Dropdown closed by outside click');
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.showDropdown) {
      this.showDropdown = false;
    }
  }

  // Prevent closing when clicking inside dropdown
  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    if ((event.target as HTMLElement).closest('.dropdown-menu')) {
      event.stopPropagation();
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
