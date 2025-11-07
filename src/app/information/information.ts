import { Component, OnInit } from '@angular/core';
import userData from './user_data.json';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-information',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  ngOnInit(): void {
    // Always load from JSON first
    if (Array.isArray(userData) && userData.length > 0) {
      this.user = { ...userData[0] }; // Create a copy of the first user
      console.log('Loaded user data:', this.user);
      
      // Save to localStorage for persistence
      localStorage.setItem('currentUser', JSON.stringify(this.user));
    } else {
      console.warn('⚠️ No user data found in user_data.json');
    }
  }

  onEdit(): void {
    this.isEditing = true;
  }

  onSave(): void {
    this.isEditing = false;
    // Update localStorage
    localStorage.setItem('currentUser', JSON.stringify(this.user));
    alert('✅ Thông tin đã được lưu thành công!');
  }
}