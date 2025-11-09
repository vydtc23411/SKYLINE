import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
export { FlightSelectionComponent as FlightSelection } from './flight-selection';

type Cabin = 'Economy' | 'Premium Economy' | 'Business';

export interface Flight {
  id: string;
  airline: string;
  flightNo: string;
  from: string;
  to: string;
  date: string;            // YYYY-MM-DD
  departTime: string;      // ISO
  arriveTime: string;      // ISO
  durationMin: number;
  price: number;
  currency: 'VND' | 'USD';
  seatsLeft: number;
  cabin: Cabin;
  details?: any;
}

/* Chuẩn hoá JSON giống bên search */
function normalizeFlights(data: any): Flight[] {
  const cur = data?.meta?.currency ?? 'VND';
  const list = Array.isArray(data) ? data : (data?.flights ?? []);
  const pick = (o: any, keys: string[], def: any = '') => {
    for (const k of keys) {
      try {
        const v = k.includes('.') ? k.split('.').reduce((x: any, kk) => x?.[kk], o) : o?.[k];
        if (v !== undefined && v !== null && v !== '') return v;
      } catch { }
    }
    return def;
  };
  return (list as any[]).map(x => {
    const departISO = String(pick(x, ['departTime', 'depart_time', 'dep_time', 'depart', 'departISO', 'depart.time']));
    const arriveISO = String(pick(x, ['arriveTime', 'arrive_time', 'arr_time', 'arrive', 'arriveISO', 'arrive.time']));
    const date = String(pick(x, ['date', 'flight_date'], departISO ? departISO.slice(0, 10) : ''));
    const from = String(pick(x, ['from', 'origin', 'from_code', 'route.from'])).toUpperCase();
    const to = String(pick(x, ['to', 'destination', 'to_code', 'route.to'])).toUpperCase();
    const price = Number(pick(x, ['price', 'fare', 'amount', 'total', 'base_price'], 0));
    const duration = Number(pick(x, ['durationMin', 'duration_min', 'duration', 'mins'], 0));
    return {
      id: String(pick(x, ['id'], `${pick(x, ['flightNo', 'number', 'flight_no'], 'XX000')}-${date}`)),
      airline: String(pick(x, ['airline', 'carrier', 'airline_name'], 'Unknown')),
      flightNo: String(pick(x, ['flightNo', 'number', 'flight_no'], 'XX000')),
      from, to, date,
      departTime: departISO,
      arriveTime: arriveISO,
      durationMin: duration,
      price,
      currency: (String(pick(x, ['currency'], cur)) as 'VND' | 'USD'),
      seatsLeft: Number(pick(x, ['seatsLeft', 'seats_left', 'seats_remaining'], 0)),
      cabin: (pick(x, ['cabin', 'class'], 'Economy') as Cabin),
      details: x.details ?? x
    };
  });
}

@Component({
  selector: 'app-flight-selection',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './flight-selection.html',
  styleUrls: ['./flight-selection.css']
})
export class FlightSelectionComponent {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  isLoading = signal(true);
  loadError = signal<string | null>(null);
  flight = signal<Flight | null>(null);

  // === GÁN SẴN HẠNG GHẾ (không lấy từ data) ===
  private readonly STATIC_CABINS = ['Phổ thông', 'Thương gia'];

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.http.get('assets/flight-search-sampledata.json').subscribe({
      next: raw => {
        const all = normalizeFlights(raw);
        const f = all.find(x => String(x.id) === String(id)) ?? null;
        this.flight.set(f);
        this.isLoading.set(false);
        if (!f) this.loadError.set('Không tìm thấy chuyến bay.');
      },
      error: () => { this.isLoading.set(false); this.loadError.set('Lỗi tải dữ liệu.'); }
    });
  }

  /* ===== Điều hướng cho 2 nút ===== */
  goBack() {
    const st = (history.state && (history.state as any).search) || null;
    if (st) {
      this.router.navigate(['/'], { state: { search: st } });
    } else if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  goChooseCabin() {
    const id = this.flight()?.id;
    const st = (history.state && (history.state as any).search) || null;
    this.router.navigate(['/chon-hang-ghe', id ?? ''], { state: { search: st } });
  }

  /* ===== Helpers ===== */
  getCarrierCode(f: Flight) {
    const code = (f as any)?.details?.airline_code?.toUpperCase?.();
    if (code) return code;
    const initials = (f.airline ?? '').split(/\s+/).filter(Boolean).map(w => w[0]).join('').slice(0, 3).toUpperCase();
    return initials || '??';
  }

  timeHM(iso?: string) {
    if (!iso) return '';
    try { return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }); }
    catch { return ''; }
  }

  dateVN(iso?: string) {
    if (!iso) return '';
    const d = new Date(iso);
    const wd = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'][d.getDay()];
    const dd = String(d.getDate()).padStart(2, '0'); const mm = String(d.getMonth() + 1).padStart(2, '0'); const yyyy = d.getFullYear();
    return `${wd}, ${dd}/${mm}/${yyyy}`;
  }

  durationStr(mins?: number) {
    if (mins == null) return '';
    const h = Math.floor(mins / 60), m = mins % 60;
    if (h && m) return `${h}h${String(m).padStart(2, '0')}m`;
    if (h) return `${h}h`;
    return `${m}m`;
  }

  // === Hiển thị "HH:mm – HH:mm (XhYm)" ===
  timeRangeText(f: Flight | null): string {
    if (!f) return '—';
    const start = this.timeHM(f.departTime);
    const end = this.timeHM(f.arriveTime);
    const dur = this.durationStr(f.durationMin);
    return `${start} – ${end} (${dur})`;
  }

  // === Hạng ghế: gán sẵn mọi chuyến ===
  cabinListText(): string {
    return this.STATIC_CABINS.join(', ');
  }

  priceStr(v?: number, cur = 'VND', style: 'symbol' | 'code' = 'code') {
    if (v == null) return '';
    try {
      if (cur === 'VND') {
        return style === 'symbol'
          ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v)
          : `${v.toLocaleString('vi-VN')} VND`;
      }
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur }).format(v);
    } catch { return `${v.toLocaleString('vi-VN')} ${cur}`; }
  }
  hasPromo(f: Flight) { return !!(f as any)?.details?.promo_code; }
  oldPrice(f: Flight) { return this.hasPromo(f) ? Math.round((f.price * 1.1) / 1000) * 1000 : null; }

  /* ===== Dữ liệu hiển thị ===== */
  promo = computed(() => this.flight()?.details?.promo_code ?? null);

  itinerary = computed(() => {
    const f = this.flight();
    const legs = f?.details?.itinerary;
    if (Array.isArray(legs) && legs.length) return legs as any[];
    if (!f) return [{
      from: '', to: '', departTime: '', arriveTime: ''
    }];
    return [{
      from: f.from, to: f.to,
      departTime: f.departTime, arriveTime: f.arriveTime,
      flightNo: f.flightNo, airline: f.airline
    }];
  });

  legDurationMin(a?: string, b?: string) {
    if (!a || !b) return 0;
    const t1 = new Date(a).getTime();
    const t2 = new Date(b).getTime();
    if (isNaN(t1) || isNaN(t2)) return 0;
    return Math.max(0, Math.round((t2 - t1) / 60000));
  }

  baggageCarryOn = computed(() => this.flight()?.details?.baggage?.carryOn ?? null);
  baggageChecked = computed(() => this.flight()?.details?.baggage?.checked ?? null);
  mealText = computed(() => {
    const v = this.flight()?.details?.meal;
    if (v === true) return 'Có';
    if (v === false) return 'Không';
    return 'Theo hãng';
  });
  wifiText = computed(() => {
    const v = this.flight()?.details?.wifi;
    if (v === true) return 'Có';
    if (v === false) return 'Không';
    return 'Theo hãng';
  });

  terminalFrom = computed(() => this.flight()?.details?.terminalFrom ?? null);
  terminalTo = computed(() => this.flight()?.details?.terminalTo ?? null);
  gate = computed(() => this.flight()?.details?.gate ?? null);
  aircraft = computed(() => this.flight()?.details?.aircraft ?? null);

  perks = computed<string[]>(() => {
    const p = this.flight()?.details?.perks;
    if (Array.isArray(p)) return p;
    return ['Hành lý xách tay 7kg', 'Miễn phí đổi lịch trong 24h (nếu có)', 'Chọn chỗ tiêu chuẩn'];
  });

  // Map mã → tên sân bay
  airportName(code?: string | null): string {
    const MAP: Record<string, string> = {
      SGN: 'Sân bay Tân Sơn Nhất',
      HAN: 'Sân bay Nội Bài',
      DAN: 'Sân bay Đà Nẵng',
      CXR: 'Sân bay Cam Ranh',
      PQC: 'Sân bay Phú Quốc',
    };
    if (!code) return '—';
    return MAP[code.toUpperCase()] ?? code.toUpperCase();
  }

  // Văn bản số điểm dừng (mặc định Bay thẳng)
  stopsText(): string {
    return this.flight()?.details?.stops || 'Bay thẳng';
  }
}
