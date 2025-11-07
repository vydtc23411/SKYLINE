import { Component, OnInit } from '@angular/core';
import userData from '../../assets/data/rewards-users.json';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-information',
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
    // ✅ Lấy thông tin người dùng từ localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
    } else {
      console.warn('⚠️ Không tìm thấy thông tin người dùng trong localStorage');
    }
  }

  onEdit(): void {
    this.isEditing = true;
  }

  onSave(): void {
    this.isEditing = false;
    // ✅ Cập nhật lại thông tin trong localStorage
    localStorage.setItem('currentUser', JSON.stringify(this.user));
    alert('✅ Thông tin đã được lưu thành công!');
  }
}