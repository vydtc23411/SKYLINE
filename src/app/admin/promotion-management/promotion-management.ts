import { Component, OnInit } from '@angular/core';
import { AdminSidebarComponent } from '../shared/sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminHeader } from '../shared/header/admin-header/admin-header';

interface Promotion {
  promoId: string;
  promoName: string;
  promoCode: string;
  promoType: string; // 'percent' | 'amount' | 'freeship'
  discountValue: number | null;
  maxDiscountAmount: number | null;
  startDate: string; 
  endDate: string; 
  status: 'active' | 'inactive'; 
  notes: string; 
  endTime: string; 
  descriptionPlaceholder?: string; 
  applyHour: string;
  applyDayOfWeek: string;
  applyDayOfMonth: string;
  applyMonth: string;
  applyYear: string;
  applyTimeframe: string;
}

// Interface cho Bảng Quản Lý (Tab 'manage')
interface PromoListItem {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  type: string; 
  applyTarget: string;
  status: 'active' | 'upcoming' | 'expired' | 'draft'; 
}
@Component({
  selector: 'app-promotion-management',
  imports: [
    AdminSidebarComponent,
    CommonModule,
    FormsModule,
    AdminHeader
  ],
  templateUrl: './promotion-management.html',
  styleUrl: './promotion-management.css',
})
export class PromotionManagement implements OnInit {
  activeMainTab: 'create' | 'manage' = 'manage'; // Mặc định là tab 'Quản lý khuyến mãi'
  activeStep: 'info' | 'apply' = 'info'; 

  // Form State
  isLimitedTime: boolean = false;
  isFormInvalid: boolean = true; 
  isDraftInvalid: boolean = true; 
  
  // Modal State
  showModalType: 'cancel' | 'draft' | 'activate' | null = null; 

  // Filter & Search State (cho tab 'manage')
  searchTerm: string = '';
  selectedStatusFilter: string = 'all';
  selectedTypeFilter: string = 'all';

  // Dữ liệu mẫu cho Form (Form Creation)
  currentPromotion: Promotion = {
    promoId: '',
    promoName: '',
    promoCode: '',
    promoType: 'percent', 
    discountValue: null,
    maxDiscountAmount: null,
    startDate: '', 
    endDate: '', 
    status: 'inactive', 
    notes: '', 
    endTime: '',
    descriptionPlaceholder: '',
    applyHour: 'any',
    applyDayOfWeek: 'any',
    applyDayOfMonth: 'any',
    applyMonth: 'any',
    applyYear: 'any',
    applyTimeframe: 'any'
  };

  // Dữ liệu mẫu cho Dropdown Lịch áp dụng
  hours = Array.from({length: 24}, (_, i) => i < 10 ? `0${i}` : `${i}`);
  daysOfWeek = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
  daysOfMonth = Array.from({length: 31}, (_, i) => i + 1);
  months = Array.from({length: 12}, (_, i) => i + 1);
  years = Array.from({length: 5}, (_, i) => new Date().getFullYear() + i);
  timeframes = ['Sáng (06:00-11:59)', 'Chiều (12:00-17:59)', 'Tối (18:00-23:59)', 'Khuya (00:00-05:59)'];

  // Dữ liệu mẫu cho Bảng Quản Lý (Table Management)
  promos: PromoListItem[] = [
    { id: 1, name: 'Flash Sale 11.11', startDate: '11/11/2025', endDate: '11/11/2025', type: 'Giảm 15% nội địa', applyTarget: 'Tất cả khách', status: 'active' },
    { id: 2, name: 'Gold member bonus', startDate: '01/12/2025', endDate: '05/12/2025', type: '+500 điểm', applyTarget: 'Thành viên Vàng', status: 'upcoming' },
    { id: 3, name: 'Combo Vé + Hành lý 20kg giảm 30%', startDate: '20/09/2025', endDate: '20/10/2025', type: 'Combo dịch vụ', applyTarget: 'Thành viên mới', status: 'expired' },
    { id: 4, name: 'Ưu đãi KBank', startDate: '01/10/2025', endDate: '31/12/2025', type: 'Hoàn tiền 10%', applyTarget: 'Người dùng thẻ KBank', status: 'active' },
    { id: 5, name: 'Ưu đãi SeABank', startDate: 'Thứ 6 hàng tuần', endDate: 'Vô thời hạn', type: 'Mua 1 tặng 1', applyTarget: 'Khách hàng SeABank', status: 'active' },
    { id: 6, name: 'Sale Tết 2026', startDate: '12/11/2025', endDate: '14/12/2025', type: 'Giảm đến 1 triệu VND', applyTarget: 'Tất cả khách hàng', status: 'upcoming' },
    { id: 7, name: 'Hoàn tiền 10% KBank', startDate: '01/10/2025', endDate: '31/12/2025', type: 'Hoàn tiền 10%', applyTarget: 'Người dùng thẻ KBank', status: 'active' },
    { id: 8, name: 'Mua 1 Tặng 1 SeABank', startDate: 'Thứ 6 hàng tuần', endDate: 'Vô thời hạn', type: 'Mua 1 tặng 1', applyTarget: 'Khách hàng SeABank', status: 'active' },
    { id: 9, name: 'Giảm 1 Triệu Zalopay/SC', startDate: '01/10/2025', endDate: '30/11/2025', type: 'Giảm 1 triệu VND', applyTarget: 'Người dùng thẻ SC', status: 'active' },
    { id: 10, name: 'Giảm 400k Zalopay', startDate: '01/11/2025', endDate: '30/11/2025', type: 'Giảm 400k VND', applyTarget: 'Tất cả khách hàng', status: 'active' },
    { id: 11, name: 'Giảm 450k UOB Tín dụng', startDate: '01/11/2025', endDate: '30/11/2025', type: 'Giảm 450k VND', applyTarget: 'Khách hàng thẻ tín dụng', status: 'active' },
    { id: 12, name: 'Giảm 250k HD Bank Trả sau', startDate: '01/11/2025', endDate: '30/11/2025', type: 'Giảm 250k VND', applyTarget: 'Tất cả khách hàng', status: 'active' },
  ];

  // Các tùy chọn Filter
  statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Đang chạy' },
    { value: 'upcoming', label: 'Sắp diễn ra' },
    { value: 'expired', label: 'Hết hạn' },
  ];

  typeOptions = [
    { value: 'all', label: 'Tất cả ưu đãi' },
    { value: 'percent', label: 'Giảm phần trăm' },
    { value: 'point', label: 'Thưởng điểm' },
    { value: 'combo', label: 'Combo/Dịch vụ' },
    { value: 'refund', label: 'Hoàn tiền' },
  ];

  constructor() { }

  ngOnInit(): void {
    this.updateFormValidity();
  }

  // --- Logic Chuyển Tab/Bước ---
  switchMainTab(tab: 'create' | 'manage') {
    this.activeMainTab = tab;
    if (tab === 'create') {
        this.activeStep = 'info';
    }
  }

  switchStep(step: 'info' | 'apply') {
    if (step === 'apply' && this.isFormInvalid) {
        alert('Vui lòng điền Tên, Mã và Giá trị giảm (nếu có) trước khi tiếp tục.');
        return;
    }
    this.activeStep = step;
    this.updateFormValidity();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Logic Form Validation ---
  updateFormValidity() {
    const p = this.currentPromotion;
    let requiredValid = true; 
    let draftValid = true;    

    // 1. Kiểm tra cơ bản (Tên & Mã) cho Bản nháp
    if (!p.promoName || p.promoName.trim() === '' || !p.promoCode || p.promoCode.trim() === '') {
        draftValid = false;
    } 

    // 2. Kiểm tra bắt buộc cho Tiếp tục/Kích hoạt (Giá trị giảm)
    if (!draftValid || p.promoType !== 'freeship' && (p.discountValue === null || p.discountValue <= 0)) {
        requiredValid = false;
    }
    
    // 3. Kiểm tra Thời gian (nếu được chọn là giới hạn)
    if (requiredValid && this.isLimitedTime && (!p.endDate || p.endDate.trim() === '')) {
        requiredValid = false;
    }
    
    this.isDraftInvalid = !draftValid; 
    this.isFormInvalid = !requiredValid; 
  }
  
  onDiscountTypeChange(type: string) {
      if (type === 'freeship') {
          this.currentPromotion.discountValue = null;
          this.currentPromotion.maxDiscountAmount = null;
      }
      this.updateFormValidity();
  }
  
  addTimeDetail() {
      alert(`Đã thêm lịch áp dụng chi tiết: Giờ=${this.currentPromotion.applyHour}, Thứ=${this.currentPromotion.applyDayOfWeek}, Ngày=${this.currentPromotion.applyDayOfMonth}`);
  }
  
  // --- Logic Bảng Quản Lý ---
  get filteredPromos(): PromoListItem[] {
    let result = this.promos;
    const term = this.searchTerm.trim().toLowerCase();

    if (this.selectedStatusFilter !== 'all') {
      result = result.filter(p => p.status === this.selectedStatusFilter);
    }
    
    if (term) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.applyTarget.toLowerCase().includes(term) ||
        p.type.toLowerCase().includes(term)
      );
    }
    
    return result;
  }
  
  editPromo(id: number) {
    // Chuyển sang tab tạo chương trình, load dữ liệu
    alert(`Đang chuyển sang chế độ chỉnh sửa khuyến mãi ID: ${id}`);
    this.activeMainTab = 'create';
    this.activeStep = 'info';
  }

  deletePromo(id: number) {
    if (confirm(`Bạn có chắc chắn muốn xóa khuyến mãi ID ${id} không?`)) {
      this.promos = this.promos.filter(p => p.id !== id);
    }
  }


  // --- Logic Modal & Buttons ---
  promptAction(type: 'cancel' | 'draft' | 'activate') {
      if (type === 'activate' && this.isFormInvalid) return; // Chặn Kích hoạt nếu form không đủ điều kiện
      if (type === 'draft' && this.isDraftInvalid) return;   // Chặn Lưu nháp nếu thiếu tên/mã
      
      this.showModalType = type;
  }

  closeModal() {
      this.showModalType = null;
  }

  confirmAction() {
      switch (this.showModalType) {
          case 'cancel':
              window.location.reload(); 
              break;
          case 'draft':
              this.currentPromotion.status = 'inactive';
              this.showModalType = null;
              alert('Lưu bản nháp thành công!');
              break;
          case 'activate':
              this.currentPromotion.status = 'active';
              this.showModalType = null;
              alert('Lưu & Kích hoạt thành công!');
              break;
      }
  }

  saveAndContinue() {
      if (this.isFormInvalid) {
        alert('Vui lòng điền Tên, Mã và Giá trị giảm (nếu có) trước khi tiếp tục.');
        return;
      }
      this.switchStep('apply');
  }
}