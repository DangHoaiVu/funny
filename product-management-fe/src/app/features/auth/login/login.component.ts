import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <div class="brand-badge">PMS</div>
          <h2 class="auth-title">Đăng Nhập Hệ Thống</h2>
          <p class="auth-subtitle">Product Management System</p>
        </div>

        @if (errorMessage()) {
          <div class="auth-alert alert-error">
            <span>{{ errorMessage() }}</span>
          </div>
        }

        @if (successMessage()) {
          <div class="auth-alert alert-success">
            <span>{{ successMessage() }}</span>
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="auth-form" #loginForm="ngForm">
          <div class="form-group">
            <label for="username" class="form-label">Tên đăng nhập <span class="required">*</span></label>
            <input
              type="text"
              id="username"
              name="username"
              [(ngModel)]="username"
              #usernameCtrl="ngModel"
              required
              class="form-input"
              [class.input-error]="usernameCtrl.invalid && (usernameCtrl.dirty || usernameCtrl.touched)"
              placeholder="Nhập tên đăng nhập"
              autocomplete="username"
            />
            @if (usernameCtrl.invalid && (usernameCtrl.dirty || usernameCtrl.touched)) {
              <small class="error-text">Vui lòng nhập tên đăng nhập</small>
            }
          </div>

          <div class="form-group">
            <div class="label-row">
              <label for="password" class="form-label">Mật khẩu <span class="required">*</span></label>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="password"
              #passwordCtrl="ngModel"
              required
              class="form-input"
              [class.input-error]="passwordCtrl.invalid && (passwordCtrl.dirty || passwordCtrl.touched)"
              placeholder="Nhập mật khẩu"
              autocomplete="current-password"
            />
            @if (passwordCtrl.invalid && (passwordCtrl.dirty || passwordCtrl.touched)) {
              <small class="error-text">Vui lòng nhập mật khẩu</small>
            }
          </div>

          <button
            type="submit"
            class="btn-submit"
            [disabled]="loginForm.invalid || isLoading()"
          >
            @if (isLoading()) {
              <span class="spinner"></span>
              <span>Đang xác thực...</span>
            } @else {
              <span>Đăng nhập</span>
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>Chưa có tài khoản? <a routerLink="/register" class="link-primary">Đăng ký ngay</a></p>
          <div class="divider"></div>
          <a routerLink="/shop" class="link-secondary">Xem danh mục sản phẩm (Khách vãng lai)</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 1.5rem;
      font-family: inherit;
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
      padding: 2.5rem 2rem;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .brand-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      background: #1a2a3a;
      color: #ffffff;
      font-weight: 800;
      font-size: 1.25rem;
      border-radius: 12px;
      margin-bottom: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .auth-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.5rem;
    }

    .auth-subtitle {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
    }

    .auth-alert {
      display: flex;
      align-items: center;
      padding: 0.875rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }

    .alert-error {
      background: #fef2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }

    .alert-success {
      background: #f0fdf4;
      color: #166534;
      border: 1px solid #bbf7d0;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .form-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #334155;
    }

    .required {
      color: #ef4444;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.925rem;
      outline: none;
      transition: all 0.2s ease;
      background: #f8fafc;
      box-sizing: border-box;
    }

    .form-input:focus {
      border-color: #2563eb;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }

    .input-error {
      border-color: #ef4444 !important;
      background: #fffafa;
    }

    .error-text {
      color: #ef4444;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .btn-submit {
      width: 100%;
      padding: 0.85rem;
      background: #1a2a3a;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: background 0.2s ease;
      margin-top: 0.5rem;
    }

    .btn-submit:hover:not(:disabled) {
      background: #273e54;
    }

    .btn-submit:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .auth-footer {
      text-align: center;
      margin-top: 1.75rem;
      font-size: 0.875rem;
      color: #64748b;
    }

    .auth-footer p {
      margin: 0;
    }

    .divider {
      height: 1px;
      background: #e2e8f0;
      margin: 1.25rem 0;
    }

    .link-primary {
      color: #2563eb;
      font-weight: 600;
      text-decoration: none;
    }

    .link-primary:hover {
      text-decoration: underline;
    }

    .link-secondary {
      color: #64748b;
      font-size: 0.825rem;
      text-decoration: none;
      display: inline-block;
      transition: color 0.2s;
    }

    .link-secondary:hover {
      color: #0f172a;
    }
  `]
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  username = '';
  password = '';
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  onSubmit(): void {
    if (!this.username.trim() || !this.password) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.authService.login({
      username: this.username.trim(),
      password: this.password
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Đăng nhập thành công! Đang chuyển hướng...');

        const returnUrl = this.route.snapshot.queryParams['returnUrl'];

        setTimeout(() => {
          if (returnUrl) {
            this.router.navigateByUrl(returnUrl);
          } else if (this.authService.isAdmin()) {
            this.router.navigate(['/admin/products']);
          } else {
            this.router.navigate(['/shop']);
          }
        }, 500);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.error?.message) {
          this.errorMessage.set(err.error.message);
        } else if (err.status === 401 || err.status === 400) {
          this.errorMessage.set('Tài khoản hoặc mật khẩu không chính xác.');
        } else if (err.status === 0) {
          this.errorMessage.set('Không thể kết nối tới máy chủ.');
        } else {
          this.errorMessage.set('Đăng nhập không thành công, vui lòng thử lại.');
        }
      }
    });
  }
}
