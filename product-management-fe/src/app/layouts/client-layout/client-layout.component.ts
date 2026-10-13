import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="client-wrapper">
      <!-- Client Navigation Bar -->
      <header class="client-navbar">
        <div class="nav-container">
          <!-- Logo -->
          <a routerLink="/shop" class="brand-link">
            <span class="brand-badge">P</span>
            <div class="brand-meta">
              <span class="brand-name">PrimeStore</span>
              <span class="brand-tagline">Mua sắm & Trải nghiệm</span>
            </div>
          </a>

          <!-- Nav Items -->
          <nav class="nav-links">
            <a routerLink="/shop" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
              Cửa Hàng
            </a>
          </nav>

          <!-- Right: Auth State & Actions -->
          <div class="nav-auth">
            @if (isAdmin()) {
              <a routerLink="/admin/products" class="btn-admin-portal" title="Chuyển sang trang Quản trị">
                Vào trang Quản trị
              </a>
            }

            @if (isLoggedIn()) {
              <div class="user-info-box">
                <div class="user-details">
                  <span class="username">{{ currentUser()?.username }}</span>
                  <span class="role-badge">{{ isAdmin() ? 'ADMIN' : 'KHÁCH HÀNG' }}</span>
                </div>
                <button (click)="onLogout()" class="btn-logout" title="Đăng xuất">
                  Đăng xuất
                </button>
              </div>
            } @else {
              <div class="auth-buttons">
                <a routerLink="/login" class="btn-login">Đăng nhập</a>
                <a routerLink="/register" class="btn-register">Đăng ký</a>
              </div>
            }
          </div>
        </div>
      </header>

      <!-- Main Client Content -->
      <main class="client-main">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="client-footer">
        <div class="footer-container">
          <p>&copy; 2026 PrimeStore - Hệ thống Mua sắm Trực tuyến. Tận hưởng chất lượng hàng đầu.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .client-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f8fafc;
      font-family: inherit;
    }

    .client-navbar {
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .nav-container {
      max-width: 1300px;
      margin: 0 auto;
      padding: 0 1.5rem;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }

    .brand-badge {
      width: 38px;
      height: 38px;
      background: #2563eb;
      color: #fff;
      font-weight: 800;
      font-size: 1.2rem;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-meta {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
    }

    .brand-tagline {
      font-size: 0.7rem;
      color: #64748b;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .nav-item {
      color: #475569;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 600;
      padding: 0.45rem 0.85rem;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .nav-item:hover, .nav-item.active {
      color: #2563eb;
      background: #eff6ff;
    }

    .nav-auth {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .btn-admin-portal {
      background: #fef3c7;
      border: 1px solid #fde68a;
      color: #92400e;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 0.4rem 0.85rem;
      border-radius: 8px;
      text-decoration: none;
      transition: background 0.2s;
    }

    .btn-admin-portal:hover {
      background: #fde68a;
    }

    .user-info-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding-left: 0.75rem;
      border-left: 1px solid #e2e8f0;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .username {
      font-size: 0.85rem;
      font-weight: 700;
      color: #1e293b;
    }

    .role-badge {
      font-size: 0.65rem;
      font-weight: 700;
      background: #dbeafe;
      color: #1d4ed8;
      padding: 1px 6px;
      border-radius: 6px;
    }

    .btn-logout {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      color: #475569;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-logout:hover {
      background: #fee2e2;
      color: #b91c1c;
      border-color: #fca5a5;
    }

    .auth-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-login {
      color: #1e293b;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      padding: 0.45rem 0.95rem;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      transition: all 0.2s;
    }

    .btn-login:hover {
      background: #f1f5f9;
    }

    .btn-register {
      background: #1a2a3a;
      color: #ffffff;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      padding: 0.45rem 0.95rem;
      border-radius: 6px;
      transition: background 0.2s;
    }

    .btn-register:hover {
      background: #273e54;
    }

    .client-main {
      flex: 1;
      max-width: 1300px;
      width: 100%;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      box-sizing: border-box;
    }

    .client-footer {
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      padding: 1.5rem;
      text-align: center;
      color: #64748b;
      font-size: 0.85rem;
    }

    @media (max-width: 768px) {
      .nav-container {
        height: auto;
        padding: 0.75rem 1rem;
        flex-wrap: wrap;
      }
    }
  `]
})
export class ClientLayoutComponent {
  private readonly authService = inject(AuthService);

  currentUser = this.authService.currentUser;
  isLoggedIn = this.authService.isAuthenticated;
  isAdmin = this.authService.isAdmin;

  onLogout(): void {
    this.authService.logout();
  }
}
