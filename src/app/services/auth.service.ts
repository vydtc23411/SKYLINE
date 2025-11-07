import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface UserWithoutPassword {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: UserWithoutPassword;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private USERS_KEY = 'users';
  private CURRENT_USER_KEY = 'currentUser';
  private assetsPath = 'assets/data/rewards-users.json';

  private usersLoaded = false;

  constructor(private http: HttpClient) {
    // kick off load (non-blocking)
    this.ensureUsersLoaded();
  }

  private async ensureUsersLoaded(): Promise<void> {
    if (this.usersLoaded) return;
    const existing = localStorage.getItem(this.USERS_KEY);
    if (existing) {
      this.usersLoaded = true;
      return;
    }

    try {
  const resp = await lastValueFrom(this.http.get<any[]>(this.assetsPath));
      if (resp && resp.length) {
        // Map incoming JSON to our User shape
        const mapped: User[] = resp.map((r: any, idx: number) => ({
          id: Date.now() + idx,
          name: r.fullName || r.name || r.full_name || r.username || '',
          email: r.email || '',
          password: r.password || '',
          createdAt: new Date().toISOString()
        }));
        localStorage.setItem(this.USERS_KEY, JSON.stringify(mapped));
      } else {
        localStorage.setItem(this.USERS_KEY, JSON.stringify([]));
      }
    } catch (e) {
      // if fetching fails, ensure users array exists
      if (!localStorage.getItem(this.USERS_KEY)) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify([]));
      }
    }

    this.usersLoaded = true;
  }

  // Lấy tất cả người dùng (sync) — đảm bảo đã có key nhưng có thể rỗng
  private getUsersSync(): User[] {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) as User[] : [];
  }

  // Đăng nhập — sử dụng dữ liệu từ assets nếu localStorage chưa có
  async login(email: string, password: string): Promise<AuthResponse> {
    await this.ensureUsersLoaded();
    const users = this.getUsersSync();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      return { success: true, message: 'Đăng nhập thành công!', user: userWithoutPassword };
    }
    return { success: false, message: 'Email hoặc mật khẩu không đúng!' };
  }

  // Đăng ký — lưu vào localStorage
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    await this.ensureUsersLoaded();
    const users = this.getUsersSync();
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Email này đã được đăng ký!' };
    }
    const newUser: User = {
      id: Date.now(),
      name,
      email,
      password,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    const { password: _, ...userWithoutPassword } = newUser;
    // store as current user (auto-login after register)
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    return { success: true, message: 'Đăng ký thành công!', user: userWithoutPassword };
  }

  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  getCurrentUser(): UserWithoutPassword | null {
    const user = localStorage.getItem(this.CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  validatePassword(password: string): boolean {
    return password.length >= 6;
  }
}
