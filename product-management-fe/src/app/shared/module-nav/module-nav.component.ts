import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-module-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="business-nav" aria-label="Phân hệ chức năng">
      <div class="nav-track">
        <a routerLink="/admin/products" routerLinkActive="active" class="nav-item">
          <span class="nav-title">Quản lý sản phẩm</span>
          @if (productCount !== undefined && productCount !== null) {
            <span class="nav-badge">{{ productCount }}</span>
          }
        </a>
        <a routerLink="/admin/categories" routerLinkActive="active" class="nav-item">
          <span class="nav-title">Quản lý danh mục</span>
          @if (categoryCount !== undefined && categoryCount !== null) {
            <span class="nav-badge">{{ categoryCount }}</span>
          }
        </a>
      </div>
    </nav>
  `,
  styles: [`
    .business-nav {
      background: #ffffff;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      margin-bottom: 1.25rem;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
      overflow-x: auto;
    }

    .nav-track {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.35rem 0.5rem;
      min-width: max-content;
    }

    .nav-item {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.85rem;
      color: #495057;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9rem;
      border-radius: 4px;
      transition: background-color 0.15s ease, color 0.15s ease;
    }

    .nav-item:hover {
      background-color: #f1f3f5;
      color: #212529;
    }

    .nav-item.active {
      background-color: #1a2a3a;
      color: #ffffff;
    }

    .nav-badge {
      font-size: 0.75rem;
      padding: 0.15rem 0.45rem;
      border-radius: 10px;
      background-color: #e9ecef;
      color: #495057;
      font-weight: 600;
    }

    .nav-item.active .nav-badge {
      background-color: #34495e;
      color: #ffffff;
    }

    @media (max-width: 768px) {
      .business-nav {
        margin-bottom: 0.75rem;
      }
      .nav-item {
        padding: 0.4rem 0.65rem;
        font-size: 0.85rem;
      }
    }
  `]
})
export class ModuleNavComponent {
  @Input() productCount?: number;
  @Input() categoryCount?: number;
}
