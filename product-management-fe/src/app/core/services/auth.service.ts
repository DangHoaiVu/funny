import { Injectable, inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthRequest, AuthResponse, RegisterRequest, UserAuth } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly baseUrl = 'http://localhost:8080/auth';
  private readonly TOKEN_KEY = 'pms_auth_token';
  private readonly USER_KEY = 'pms_user_info';

  // Signals quản lý State
  private readonly currentUserSignal = signal<UserAuth | null>(this.getStoredUser());
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal() && !!this.getToken());
  readonly isAdmin = computed(() => {
    const user = this.currentUserSignal();
    return !!user && Array.isArray(user.roles) && user.roles.includes('ROLE_ADMIN');
  });

  /**
   * Gọi API đăng nhập POST /auth/login
   */
  login(req: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, req).pipe(
      tap((res) => {
        if (res && res.token) {
          const user = this.parseTokenToUser(res.token, req.username);
          this.saveAuthSession(res.token, user);
        }
      })
    );
  }

  /**
   * Gọi API đăng ký POST /auth/register
   */
  register(req: RegisterRequest): Observable<string> {
    return this.http.post(`${this.baseUrl}/register`, req, { responseType: 'text' });
  }

  /**
   * Đăng xuất và điều hướng về trang Login
   */
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Lấy JWT token hiện tại
   */
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  /**
   * Kiểm tra người dùng đã đăng nhập chưa
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Lưu phiên làm việc vào localStorage và cập nhật Signal
   */
  private saveAuthSession(token: string, user: UserAuth): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
    this.currentUserSignal.set(user);
  }

  /**
   * Đọc thông tin User đã lưu
   */
  private getStoredUser(): UserAuth | null {
    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem(this.USER_KEY);
      if (data) {
        try {
          return JSON.parse(data) as UserAuth;
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Giải mã JWT Payload để lấy username và roles
   */
  private parseTokenToUser(token: string, fallbackUsername: string): UserAuth {
    try {
      const parts = token.split('.');
      if (parts.length >= 2) {
        const payloadStr = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
        const payload = JSON.parse(decodeURIComponent(escape(payloadStr)));
        const username = payload.sub || fallbackUsername;
        let roles: string[] = [];

        if (Array.isArray(payload.roles)) {
          roles = payload.roles;
        } else if (typeof payload.roles === 'string') {
          roles = [payload.roles];
        } else if (username === 'vudh22') {
          // Fallback cho tài khoản admin seed
          roles = ['ROLE_ADMIN', 'ROLE_USER'];
        } else {
          roles = ['ROLE_USER'];
        }

        return {
          username,
          roles,
          token
        };
      }
    } catch (e) {
      console.warn('Không thể parse payload từ JWT, sử dụng thông tin dự phòng:', e);
    }

    return {
      username: fallbackUsername,
      roles: fallbackUsername === 'vudh22' ? ['ROLE_ADMIN', 'ROLE_USER'] : ['ROLE_USER'],
      token
    };
  }
}
