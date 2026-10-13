import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-wrapper">
      <!-- Admin Header -->
      <header class="admin-header">
        <div class="header-container">
          <!-- Brand -->
          <div class="header-brand">
            <span class="brand-logo">A</span>
            <div>
              <span class="brand-title">PMS Admin</span>
              <span class="brand-subtitle">Quản trị Hệ thống</span>
            </div>
          </div>

          <!-- Navigation Links -->
          <nav class="admin-nav">
            <a routerLink="/admin/products" routerLinkActive="active" class="nav-btn">
              Quản lý Sản phẩm
            </a>
            <a routerLink="/admin/categories" routerLinkActive="active" class="nav-btn">
              Quản lý Danh mục
            </a>
          </nav>

          <!-- Right Action: User & Logout -->
          <div class="header-actions">
            <a routerLink="/shop" class="btn-shop-preview" title="Xem giao diện Khách hàng">
              Xem Shop
            </a>

            <div class="user-profile">
              <div class="user-meta">
                <span class="user-name">{{ currentUser()?.username || 'Admin' }}</span>
                <span class="user-badge">ROLE_ADMIN</span>
              </div>
              <button (click)="onLogout()" class="btn-logout" title="Đăng xuất khỏi hệ thống">
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Admin Content Area -->
      <main class="admin-main">
        <router-outlet></router-outlet>
      </main>

      <!-- Admin Footer -->
      <footer class="admin-footer">
        <p>&copy; 2026 Product Management System - Phiên bản Quản trị Doanh nghiệp</p>
      </footer>
    </div>
  `,
  styles: [`
    .admin-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f8f9fa;
      font-family: inherit;
    }

    .admin-header {
      background: #1a2a3a;
      color: #ffffff;
      padding: 0 1.5rem;
      border-bottom: 2px solid #273e54;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-container {
      max-width: 1400px;
      margin: 0 auto;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .header-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .brand-logo {
      width: 36px;
      height: 36px;
      background: #2563eb;
      color: #fff;
      font-weight: 700;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }

    .brand-title {
      font-weight: 700;
      font-size: 1rem;
      display: block;
      line-height: 1.2;
    }

    .brand-subtitle {
      font-size: 0.7rem;
      color: #94a3b8;
      display: block;
    }

    .admin-nav {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-btn {
      color: #cbd5e1;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      padding: 0.45rem 0.85rem;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .nav-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }

    .nav-btn.active {
      background: #2563eb;
      color: #ffffff;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .btn-shop-preview {
      font-size: 0.8rem;
      color: #ffffff;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      text-decoration: none;
      transition: background 0.2s;
    }

    .btn-shop-preview:hover {
      background: rgba(255, 255, 255, 0.22);
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding-left: 0.75rem;
      border-left: 1px solid rgba(255, 255, 255, 0.2);
    }

    .user-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .user-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: #ffffff;
    }

    .user-badge {
      font-size: 0.65rem;
      font-weight: 700;
      background: #ef4444;
      color: #ffffff;
      padding: 1px 6px;
      border-radius: 10px;
    }

    .btn-logout {
      background: transparent;
      border: 1px solid #ef4444;
      color: #fca5a5;
      padding: 0.3rem 0.65rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-logout:hover {
      background: #ef4444;
      color: #ffffff;
    }

    .admin-main {
      flex: 1;
      padding: 1.5rem;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
      box-sizing: border-box;
    }

    .admin-footer {
      background: #ffffff;
      border-top: 1px solid #dee2e6;
      padding: 1rem;
      text-align: center;
      color: #64748b;
      font-size: 0.8rem;
    }

    @media (max-width: 768px) {
      .header-container {
        height: auto;
        padding: 0.75rem 0;
        flex-wrap: wrap;
      }
      .admin-nav {
        order: 3;
        width: 100%;
        margin-top: 0.5rem;
      }
    }
  `]
})
export class AdminLayoutComponent {
  private readonly authService = inject(AuthService);

  currentUser = this.authService.currentUser;

  onLogout(): void {
    this.authService.logout();
  }
}
