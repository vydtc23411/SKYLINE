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
  private USER_SESSION_KEY = 'userSession';
  private assetsPath = 'assets/data/user_data.json';
  
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

  // Đăng nhập — kiểm tra cả localStorage (tài khoản đăng ký) và file JSON (tài khoản có sẵn)
  async login(email: string, password: string): Promise<AuthResponse> {
    await this.ensureUsersLoaded();
    
    // Bước 1: Kiểm tra trong localStorage (tài khoản đã đăng ký)
    const localUsers = this.getUsersSync();
    const localUser = localUsers.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    if (localUser) {
      console.log('Found user in localStorage:', localUser.email);
      
      const userToStore: UserWithoutPassword = {
        id: localUser.id,
        name: localUser.name,
        email: localUser.email,
        createdAt: localUser.createdAt
      };
      
      const session = {
        user: userToStore,
        fullUserData: localUser,
        timestamp: new Date().getTime(),
        expiresIn: 24 * 60 * 60 * 1000 // 24 giờ
      };
      
      localStorage.setItem(this.USER_SESSION_KEY, JSON.stringify(session));
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userToStore));
      localStorage.setItem('fullUserData', JSON.stringify(localUser));
      
      return { 
        success: true, 
        message: 'Đăng nhập thành công!', 
        user: userToStore 
      };
    }
    
    // Bước 2: Nếu không tìm thấy trong localStorage, kiểm tra file JSON
    try {
      console.log('Checking users from file:', this.assetsPath);
      const users = await lastValueFrom(this.http.get<any[]>(this.assetsPath));
      
      const user = users.find(u => {
        const emailMatch = u.email.toLowerCase() === email.toLowerCase();
        const passwordMatch = u.password === password;
        return emailMatch && passwordMatch;
      });
      
      if (user) {
        console.log('Found user in JSON file:', user.email);
        
        const userToStore: UserWithoutPassword = {
          id: Date.now(),
          name: user.fullName || user.name,
          email: user.email,
          createdAt: new Date().toISOString()
        };
        
        const session = {
          user: userToStore,
          fullUserData: user,
          timestamp: new Date().getTime(),
          expiresIn: 24 * 60 * 60 * 1000 // 24 giờ
        };
        
        localStorage.setItem(this.USER_SESSION_KEY, JSON.stringify(session));
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userToStore));
        localStorage.setItem('fullUserData', JSON.stringify(user));
        
        return { 
          success: true, 
          message: 'Đăng nhập thành công!', 
          user: userToStore 
        };
      }
    } catch (error) {
      console.error('Error loading user data from file:', error);
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
    localStorage.removeItem(this.USER_SESSION_KEY);
    localStorage.removeItem('fullUserData');
  }

  getCurrentUser(): UserWithoutPassword | null {
    // Kiểm tra session trước
    const session = localStorage.getItem(this.USER_SESSION_KEY);
    if (session) {
      const sessionData = JSON.parse(session);
      const now = new Date().getTime();
      
      // Kiểm tra session có còn hiệu lực
      if (now - sessionData.timestamp <= sessionData.expiresIn) {
        return sessionData.user;
      } else {
        // Session hết hạn, xóa dữ liệu
        this.logout();
        return null;
      }
    }
    
    // Fallback về cách cũ nếu không có session
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
