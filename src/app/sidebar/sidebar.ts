import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  user: any = {
    fullName: 'Khách chưa đăng nhập',
    avatar: 'assets/img/AVT0.jpg'
  };

  ngOnInit(): void {
    // ✅ Lấy thông tin user đang đăng nhập từ localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
    }
  }
}