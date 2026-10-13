import { Component, OnInit, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-shop-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="shop-page">
      <!-- Hero Banner -->
      <section class="shop-hero">
        <h1 class="hero-title">Khám Phá Sản Phẩm PrimeStore</h1>
        <p class="hero-subtitle">Sản phẩm chính hãng chất lượng cao, giá ưu đãi tốt nhất mỗi ngày</p>
      </section>

      <!-- Filter & Search Bar -->
      <section class="filter-bar">
        <div class="search-box">
          <input
            type="text"
            [(ngModel)]="searchKeyword"
            (input)="onSearchChange()"
            placeholder="Tìm kiếm sản phẩm theo tên..."
            class="search-input"
          />
        </div>

        <div class="category-filter">
          <select
            [(ngModel)]="selectedCategoryName"
            (change)="onCategoryChange()"
            class="category-select"
          >
            <option value="">Tất cả danh mục ({{ products().length }})</option>
            @for (cat of categories(); track cat.id) {
              <option [value]="cat.name">{{ cat.name }}</option>
            }
          </select>
        </div>
      </section>

      <!-- Products Grid -->
      @if (isLoading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Đang tải danh sách sản phẩm...</p>
        </div>
      } @else if (filteredProducts().length === 0) {
        <div class="empty-state">
          <h3>Không tìm thấy sản phẩm phù hợp</h3>
          <p>Hãy thử tìm kiếm từ khóa khác hoặc bỏ chọn bộ lọc danh mục.</p>
        </div>
      } @else {
        <div class="products-grid">
          @for (prod of filteredProducts(); track prod.id) {
            <div class="product-card">
              <div class="card-image-wrap">
                @if (prod.imageUrl) {
                  <img [src]="prod.imageUrl" [alt]="prod.name" class="card-img" loading="lazy" />
                } @else {
                  <div class="no-img">Không có ảnh</div>
                }
                <span class="category-tag">{{ prod.categoryName || 'Chung' }}</span>
              </div>

              <div class="card-body">
                <span class="sku-code">Mã SP: #{{ prod.id }}</span>
                <h3 class="product-name" [title]="prod.name">{{ prod.name }}</h3>

                <div class="price-stock-row">
                  <div class="price-box">
                    <span class="price-val">{{ prod.price | number:'1.0-0' }} ₫</span>
                  </div>
                  <div class="stock-status">
                    @if (prod.quantity > 0) {
                      <span class="in-stock">Còn {{ prod.quantity }} chiếc</span>
                    } @else {
                      <span class="out-stock">Hết hàng</span>
                    }
                  </div>
                </div>

                <button class="btn-detail" (click)="openDetail(prod)">
                  Xem chi tiết
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Product Detail Modal -->
      @if (activeProduct()) {
        <div class="modal-overlay" (click)="closeDetail()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">{{ activeProduct()?.name }}</h3>
              <button class="modal-close" (click)="closeDetail()">&times;</button>
            </div>

            <div class="modal-body">
              <div class="modal-img-wrap">
                @if (activeProduct()?.imageUrl) {
                  <img [src]="activeProduct()?.imageUrl" [alt]="activeProduct()?.name" class="modal-img" />
                } @else {
                  <div class="modal-no-img">Không có hình ảnh</div>
                }
              </div>

              <div class="modal-info">
                <div class="info-row">
                  <span class="label">Mã sản phẩm:</span>
                  <span class="val">#{{ activeProduct()?.id }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Danh mục:</span>
                  <span class="val badge">{{ activeProduct()?.categoryName || 'Chưa phân loại' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Giá bán niêm yết:</span>
                  <span class="val price">{{ activeProduct()?.price | number:'1.0-0' }} ₫</span>
                </div>
                <div class="info-row">
                  <span class="label">Tình trạng kho hàng:</span>
                  <span class="val">
                    @if ((activeProduct()?.quantity ?? 0) > 0) {
                      <span class="text-success font-bold">Còn hàng ({{ activeProduct()?.quantity }} chiếc)</span>
                    } @else {
                      <span class="text-danger font-bold">Tạm thời hết hàng</span>
                    }
                  </span>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-close-modal" (click)="closeDetail()">Đóng</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .shop-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .shop-hero {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      color: #ffffff;
      padding: 2.5rem 2rem;
      border-radius: 12px;
      text-align: center;
    }

    .hero-title {
      font-size: 1.85rem;
      font-weight: 800;
      margin: 0 0 0.5rem;
    }

    .hero-subtitle {
      font-size: 0.95rem;
      color: #94a3b8;
      margin: 0;
    }

    .filter-bar {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      background: #ffffff;
      padding: 1rem;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    }

    .search-box {
      flex: 1;
      min-width: 250px;
    }

    .search-input {
      width: 100%;
      padding: 0.65rem 1rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.9rem;
      outline: none;
      box-sizing: border-box;
    }

    .search-input:focus {
      border-color: #2563eb;
    }

    .category-filter {
      min-width: 200px;
    }

    .category-select {
      width: 100%;
      padding: 0.65rem 1rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.9rem;
      outline: none;
      background: #ffffff;
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 4rem 1rem;
      color: #64748b;
    }

    .empty-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 0.75rem;
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #cbd5e1;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.5rem;
    }

    .product-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
    }

    .card-image-wrap {
      height: 190px;
      background: #f1f5f9;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .no-img {
      color: #94a3b8;
      font-size: 0.85rem;
    }

    .category-tag {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(15, 23, 42, 0.75);
      color: #ffffff;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      backdrop-filter: blur(4px);
    }

    .card-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .sku-code {
      font-size: 0.75rem;
      color: #94a3b8;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .product-name {
      font-size: 1.05rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 0.75rem;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .price-stock-row {
      margin-top: auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1rem;
    }

    .price-val {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
    }

    .in-stock {
      font-size: 0.75rem;
      color: #16a34a;
      font-weight: 600;
    }

    .out-stock {
      font-size: 0.75rem;
      color: #dc2626;
      font-weight: 600;
    }

    .btn-detail {
      width: 100%;
      padding: 0.65rem;
      background: #f1f5f9;
      color: #1e293b;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: background 0.15s;
    }

    .btn-detail:hover {
      background: #e2e8f0;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1.5rem;
    }

    .modal-card {
      background: #ffffff;
      border-radius: 12px;
      width: 100%;
      max-width: 550px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
    }

    .modal-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title {
      font-size: 1.2rem;
      font-weight: 700;
      margin: 0;
    }

    .modal-close {
      background: transparent;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #64748b;
    }

    .modal-body {
      padding: 1.5rem;
      display: grid;
      grid-template-columns: 180px 1fr;
      gap: 1.5rem;
    }

    .modal-img-wrap {
      height: 180px;
      background: #f8fafc;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .modal-no-img {
      color: #94a3b8;
      font-size: 0.85rem;
    }

    .modal-info {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
    }

    .info-row .label {
      color: #64748b;
      font-weight: 500;
    }

    .info-row .val {
      font-weight: 600;
      color: #1e293b;
    }

    .info-row .val.price {
      color: #0f172a;
      font-size: 1.1rem;
      font-weight: 800;
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
    }

    .btn-close-modal {
      padding: 0.5rem 1.25rem;
      background: #1a2a3a;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    }

    @media (max-width: 640px) {
      .modal-body {
        grid-template-columns: 1fr;
      }
      .modal-img-wrap {
        height: 150px;
      }
    }
  `]
})
export class ShopProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly platformId = inject(PLATFORM_ID);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal(true);

  searchKeyword = '';
  selectedCategoryName = '';
  activeProduct = signal<Product | null>(null);

  filteredProducts = computed(() => {
    let list = this.products();
    if (this.selectedCategoryName) {
      list = list.filter(p => p.categoryName === this.selectedCategoryName);
    }
    if (this.searchKeyword.trim()) {
      const q = this.searchKeyword.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q))
      );
    }
    return list;
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadData();
    } else {
      this.isLoading.set(false);
    }
  }

  loadData(): void {
    this.isLoading.set(true);
    this.productService.getAll().subscribe({
      next: (prods) => {
        this.products.set(prods || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Lỗi tải sản phẩm:', err);
        this.isLoading.set(false);
      }
    });

    this.categoryService.getAll().subscribe({
      next: (cats) => {
        this.categories.set(cats || []);
      },
      error: (err) => console.error('Lỗi tải danh mục:', err)
    });
  }

  onSearchChange(): void {
    // Computed signal tự động cập nhật
  }

  onCategoryChange(): void {
    // Computed signal tự động cập nhật
  }

  openDetail(prod: Product): void {
    this.activeProduct.set(prod);
  }

  closeDetail(): void {
    this.activeProduct.set(null);
  }
}
