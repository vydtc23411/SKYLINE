import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-information',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './information.html',
  styleUrl: './information.css',
})
export class Information implements OnInit {
  user: any = null;
  isEditing = false;

  // danh sách quốc gia gợi ý
  countries: string[] = [
    'Việt Nam',
    'Nhật Bản',
    'Hàn Quốc',
    'Hoa Kỳ',
    'Pháp',
    'Đức',
    'Anh',
    'Singapore'
  ];

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    // Ưu tiên lấy từ localStorage nếu đã có
    const saved = localStorage.getItem('fullUserData');
    if (saved) {
      this.user = JSON.parse(saved);
      console.log('🔹 Loaded from localStorage:', this.user);
    } else {
      // Nếu chưa có, tải từ file JSON
      this.http.get<any[]>('assets/data/user_data.json').subscribe({
        next: (data) => {
          if (Array.isArray(data) && data.length > 0) {
            this.user = { ...data[0] };
            console.log('📦 Loaded from JSON:', this.user);

            // Cập nhật vào AuthService & localStorage
            const currentUser = {
              id: Date.now(),
              name: this.user.fullName,
              email: this.user.email,
              createdAt: new Date().toISOString(),
            };

            localStorage.setItem('fullUserData', JSON.stringify(this.user));
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
          } else {
            console.warn('⚠️ No user data found in user_data.json');
          }
        },
        error: (err) => console.error('❌ Failed to load JSON:', err),
      });
    }
  }

  onEdit(): void {
    this.isEditing = true;
  }

  onSave(): void {
    this.isEditing = false;
    localStorage.setItem('fullUserData', JSON.stringify(this.user));
    alert('✅ Thông tin đã được lưu thành công!');
  }
}