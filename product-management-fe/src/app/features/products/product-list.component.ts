import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModuleNavComponent } from '../../shared/module-nav/module-nav.component';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { PageResponse, Product, ProductFilterParams, ProductRequest } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ModuleNavComponent],
  template: `
    <app-module-nav [productCount]="totalElements()" [categoryCount]="categories().length"></app-module-nav>

    <!-- Business Metrics Overview -->
    <section class="metrics-grid" aria-label="Thống kê dữ liệu sản phẩm">
      <div class="metric-card">
        <span class="metric-label">Tổng sản phẩm</span>
        <span class="metric-value">{{ totalElements() }}</span>
        <span class="metric-sub">Theo kết quả lọc hiện tại</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Sản phẩm trên trang</span>
        <span class="metric-value text-primary">{{ products().length }}</span>
        <span class="metric-sub">Trang {{ pageIndex() + 1 }} / {{ totalPages() || 1 }}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Hết hàng (Trang này)</span>
        <span class="metric-value text-warning">{{ outOfStockOnPage() }}</span>
        <span class="metric-sub">Số lượng tồn = 0</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Giá trị trang này</span>
        <span class="metric-value">{{ pageInventoryValue() | number:'1.0-0' }} ₫</span>
        <span class="metric-sub">Tính theo đơn giá và tồn</span>
      </div>
    </section>

    <!-- Error / Success Notification -->
    @if (errorMessage()) {
      <div class="alert alert-danger" role="alert">
        <div class="alert-content">
          <strong>Thông báo lỗi:</strong>
          @if (errorList().length > 0) {
            <ul class="error-list">
              @for (msg of errorList(); track msg) {
                <li>{{ msg }}</li>
              }
            </ul>
          } @else {
            <span>{{ errorMessage() }}</span>
          }
        </div>
        <button class="alert-close" (click)="clearErrors()">&times;</button>
      </div>
    }
    @if (successMessage()) {
      <div class="alert alert-success" role="alert">
        <span>{{ successMessage() }}</span>
        <button class="alert-close" (click)="successMessage.set(null)">&times;</button>
      </div>
    }

    <!-- Advanced Business Filter Panel -->
    <section class="filter-panel" aria-label="Bộ lọc tìm kiếm và sắp xếp">
      <div class="filter-header">
        <h3 class="panel-title">Bộ lọc & Tìm kiếm sản phẩm</h3>
        <div class="panel-actions">
          <button type="button" class="btn btn-secondary btn-sm" (click)="resetFilters()">
            Đặt lại bộ lọc
          </button>
          <button type="button" class="btn btn-primary btn-sm" (click)="applyFilters()">
            Áp dụng lọc
          </button>
          <button type="button" class="btn btn-success btn-sm" (click)="openAddModal()">
            + Thêm sản phẩm mới
          </button>
        </div>
      </div>

      <!-- Filter Controls Grid -->
      <div class="filter-controls-grid">
        <!-- Search Keyword -->
        <div class="filter-field">
          <label class="field-label">Từ khóa tìm kiếm</label>
          <input
            type="text"
            class="input-control"
            [(ngModel)]="filterName"
            (keyup.enter)="applyFilters()"
            placeholder="Tìm theo tên sản phẩm..."
          />
        </div>

        <!-- Category Dropdown -->
        <div class="filter-field">
          <label class="field-label">Danh mục sản phẩm</label>
          <select class="input-control" [(ngModel)]="filterCategoryId" (change)="applyFilters()">
            <option [ngValue]="null">-- Tất cả danh mục --</option>
            @for (cat of categories(); track cat.id) {
              <option [ngValue]="cat.id">{{ cat.name }} (ID: {{ cat.id }})</option>
            }
          </select>
        </div>

        <!-- Sorting Field & Direction -->
        <div class="filter-field">
          <label class="field-label">Sắp xếp theo</label>
          <select class="input-control" [(ngModel)]="filterSort" (change)="applyFilters()">
            <option value="id,desc">Mới nhất</option>
            <option value="id,asc">Cũ nhất</option>
            <option value="price,asc">Đơn giá: Thấp đến cao</option>
            <option value="price,desc">Đơn giá: Cao đến thấp</option>
            <option value="name,asc">Tên sản phẩm: A đến Z</option>
            <option value="name,desc">Tên sản phẩm: Z đến A</option>
          </select>
        </div>

        <!-- Page Size -->
        <div class="filter-field field-small">
          <label class="field-label">Dòng / Trang</label>
          <select class="input-control" [(ngModel)]="pageSize" (change)="onPageSizeChange()">
            <option [ngValue]="5">5 dòng</option>
            <option [ngValue]="10">10 dòng</option>
            <option [ngValue]="20">20 dòng</option>
            <option [ngValue]="50">50 dòng</option>
          </select>
        </div>
      </div>

      <!-- Price Range Row -->
      <div class="price-filter-row">
        <div class="price-inputs">
          <span class="field-label">Khoảng giá (VNĐ):</span>
          <div class="range-group">
            <input
              type="number"
              class="input-control input-number"
              [(ngModel)]="filterMinPrice"
              placeholder="Giá tối thiểu"
              min="0"
              step="500000"
              (keyup.enter)="applyFilters()"
            />
            <span class="range-sep">—</span>
            <input
              type="number"
              class="input-control input-number"
              [(ngModel)]="filterMaxPrice"
              placeholder="Giá tối đa"
              min="0"
              step="500000"
              (keyup.enter)="applyFilters()"
            />
          </div>
        </div>

        <!-- Quick Price Preset Badges -->
        <div class="price-presets">
          <span class="preset-label">Mức giá nhanh:</span>
          <button type="button" class="preset-btn" [class.active]="isPresetActive(0, null)" (click)="setPricePreset(0, null)">Tất cả</button>
          <button type="button" class="preset-btn" [class.active]="isPresetActive(0, 10000000)" (click)="setPricePreset(0, 10000000)">&lt; 10M</button>
          <button type="button" class="preset-btn" [class.active]="isPresetActive(10000000, 30000000)" (click)="setPricePreset(10000000, 30000000)">10M - 30M</button>
          <button type="button" class="preset-btn" [class.active]="isPresetActive(30000000, 60000000)" (click)="setPricePreset(30000000, 60000000)">30M - 60M</button>
          <button type="button" class="preset-btn" [class.active]="isPresetActive(60000000, null)" (click)="setPricePreset(60000000, null)">&gt; 60M</button>
        </div>
      </div>
    </section>

    <!-- Business Data Table -->
    <section class="table-container" aria-label="Danh sách sản phẩm">
      <table class="business-table">
        <thead>
          <tr>
            <th style="width: 60px;" class="cell-center">STT</th>
            <th style="width: 85px;" class="cell-center">Hình ảnh</th>
            <th>Tên sản phẩm</th>
            <th style="width: 160px;">Danh mục</th>
            <th style="width: 150px; text-align: right;">Đơn giá</th>
            <th style="width: 100px; text-align: center;">Tồn kho</th>
            <th style="width: 120px; text-align: center;">Trạng thái</th>
            <th style="width: 170px; text-align: center;">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          @if (isLoading()) {
            <tr>
              <td colspan="8" class="loading-state">
                <span class="loading-spinner"></span>
                <span>Đang tải dữ liệu từ máy chủ Backend...</span>
              </td>
            </tr>
          } @else if (products().length === 0) {
            <tr>
              <td colspan="8" class="empty-state">
                <p>Không có sản phẩm nào phù hợp với điều kiện tìm kiếm và bộ lọc hiện tại.</p>
                <button type="button" class="btn btn-secondary btn-sm" style="margin-top: 0.5rem;" (click)="resetFilters()">
                  Xóa bộ lọc
                </button>
              </td>
            </tr>
          } @else {
            @for (prod of products(); track prod.id; let i = $index) {
              <tr>
                <td class="cell-center cell-stt">{{ pageIndex() * pageSize + i + 1 }}</td>
                <!-- Product Thumbnail Cell -->
                <td class="cell-center">
                  @if (prod.imageUrl) {
                    <div class="thumb-container" (click)="openImagePreview(prod)" title="Xem ảnh lớn">
                      <img [src]="prod.imageUrl" [alt]="prod.name" class="table-thumb-img" loading="lazy" />
                      <span class="thumb-hover-overlay">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                      </span>
                    </div>
                  } @else {
                    <button type="button" class="thumb-placeholder-btn" (click)="openImageUpload(prod)" title="Chưa có ảnh. Bấm để tải ảnh lên Cloudinary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.8">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      <span class="placeholder-caption">+ Tải ảnh</span>
                    </button>
                  }
                </td>
                <td class="cell-name">
                  <strong>{{ prod.name }}</strong>
                </td>
                <td>
                  <span class="category-badge">{{ prod.categoryName || 'Chưa phân loại' }}</span>
                </td>
                <td class="cell-number font-medium">
                  {{ prod.price | number:'1.0-0' }} ₫
                </td>
                <td class="cell-center">
                  <span [class.text-danger]="prod.quantity === 0" [class.font-bold]="prod.quantity === 0">
                    {{ prod.quantity }}
                  </span>
                </td>
                <td class="cell-center">
                  <span class="status-badge" [ngClass]="prod.quantity > 0 ? 'status-active' : 'status-out_of_stock'">
                    {{ prod.quantity > 0 ? 'Còn hàng' : 'Hết hàng' }}
                  </span>
                </td>
                <td class="cell-center">
                  <div class="table-actions">
                    <button class="action-btn" (click)="editProduct(prod)" title="Chỉnh sửa thông tin">
                      Sửa
                    </button>
                    <button class="action-btn action-btn-accent" (click)="openImageUpload(prod)" title="Tải lên / Đổi hình ảnh Cloudinary">
                      Ảnh
                    </button>
                    <button class="action-btn text-danger" (click)="deleteProduct(prod)" title="Xóa sản phẩm">
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </section>

    <!-- Server-side Pagination & Summary Footer -->
    <div class="table-footer">
      <div class="summary-text">
        Hiển thị <strong>{{ paginationInfo().start }}</strong> - <strong>{{ paginationInfo().end }}</strong> trong tổng số <strong>{{ totalElements() }}</strong> sản phẩm
        @if (totalPages() > 0) {
          (Trang <strong>{{ pageIndex() + 1 }}</strong> / <strong>{{ totalPages() }}</strong>)
        }
      </div>

      <div class="pagination-controls" aria-label="Điều hướng phân trang">
        <button
          type="button"
          class="page-btn"
          [disabled]="pageIndex() === 0 || isLoading()"
          (click)="goToPage(0)"
          title="Trang đầu tiên"
        >
          &laquo; Đầu
        </button>
        <button
          type="button"
          class="page-btn"
          [disabled]="pageIndex() === 0 || isLoading()"
          (click)="goToPage(pageIndex() - 1)"
          title="Trang trước"
        >
          &lsaquo; Trước
        </button>

        @for (p of pageNumberList(); track p) {
          <button
            type="button"
            class="page-btn"
            [class.active]="p === pageIndex()"
            [disabled]="isLoading()"
            (click)="goToPage(p)"
          >
            {{ p + 1 }}
          </button>
        }

        <button
          type="button"
          class="page-btn"
          [disabled]="pageIndex() >= totalPages() - 1 || isLoading()"
          (click)="goToPage(pageIndex() + 1)"
          title="Trang tiếp theo"
        >
          Sau &rsaquo;
        </button>
        <button
          type="button"
          class="page-btn"
          [disabled]="pageIndex() >= totalPages() - 1 || isLoading()"
          (click)="goToPage(totalPages() - 1)"
          title="Trang cuối cùng"
        >
          Cuối &raquo;
        </button>
      </div>
    </div>

    <!-- Modal Form (Add / Edit Product) -->
    @if (showModal()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingId() ? 'Chỉnh sửa thông tin sản phẩm' : 'Thêm mới sản phẩm' }}</h3>
            <button type="button" class="modal-close" (click)="closeModal()">&times;</button>
          </div>
          <form class="modal-body" (submit)="saveProduct($event)">
            <div class="form-group">
              <label class="form-label">Tên sản phẩm <span class="text-danger">*</span></label>
              <input
                type="text"
                class="input-control"
                [(ngModel)]="formData.name"
                name="name"
                placeholder="Nhập tên sản phẩm..."
                required
                autofocus
              />
            </div>

            <div class="form-group">
              <label class="form-label">Danh mục sản phẩm <span class="text-danger">*</span></label>
              @if (categories().length === 0) {
                <div class="alert alert-warning" style="margin-bottom: 0.5rem; font-size: 0.85rem;">
                  Hệ thống chưa có danh mục. Vui lòng tạo danh mục ở phân hệ Quản lý danh mục trước!
                </div>
              }
              <select class="input-control" [(ngModel)]="formData.categoryId" name="categoryId" required>
                <option [ngValue]="null" disabled>-- Chọn danh mục --</option>
                @for (cat of categories(); track cat.id) {
                  <option [ngValue]="cat.id">{{ cat.name }} (ID: {{ cat.id }})</option>
                }
              </select>
            </div>

            <div class="form-row">
              <div class="form-group col">
                <label class="form-label">Đơn giá (VNĐ) <span class="text-danger">*</span></label>
                <input
                  type="number"
                  class="input-control"
                  [(ngModel)]="formData.price"
                  name="price"
                  min="0.01"
                  step="any"
                  placeholder="0"
                  required
                />
              </div>
              <div class="form-group col">
                <label class="form-label">Số lượng tồn kho <span class="text-danger">*</span></label>
                <input
                  type="number"
                  class="input-control"
                  [(ngModel)]="formData.quantity"
                  name="quantity"
                  min="0"
                  step="1"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <!-- Image File Attachment in Form -->
            <div class="form-group">
              <label class="form-label">Hình ảnh sản phẩm (Cloudinary)</label>
              @if (formData.existingImageUrl && !formFilePreview) {
                <div class="existing-image-box">
                  <img [src]="formData.existingImageUrl" alt="Ảnh hiện tại" class="existing-thumb-img" />
                  <div class="existing-meta">
                    <span class="existing-title">Ảnh hiện tại của sản phẩm</span>
                    <span class="existing-hint">Chọn tệp bên dưới nếu muốn thay thế ảnh mới</span>
                  </div>
                </div>
              }

              <div class="file-dropzone" [class.has-file]="!!formSelectedFile">
                <input
                  type="file"
                  id="formProductImage"
                  class="file-input-hidden"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  (change)="onFormFileSelected($event)"
                />
                <label for="formProductImage" class="file-dropzone-label">
                  @if (formFilePreview) {
                    <div class="dropzone-preview-card">
                      <img [src]="formFilePreview" alt="Xem trước ảnh" class="preview-img" />
                      <div class="preview-info">
                        <span class="preview-filename">{{ formSelectedFile?.name }}</span>
                        <span class="preview-filesize">{{ formatFileSize(formSelectedFile?.size || 0) }}</span>
                        <span class="upload-ready-tag">Sẽ tự động tải lên khi lưu</span>
                      </div>
                      <button type="button" class="btn-clear-file" (click)="clearFormFile($event)" title="Hủy chọn ảnh">&times;</button>
                    </div>
                  } @else {
                    <div class="dropzone-empty-prompt">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#495057" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <span class="prompt-text">Bấm để chọn ảnh từ máy tính</span>
                      <span class="prompt-subtext">Hỗ trợ định dạng JPG, PNG, WEBP (tối đa 5MB)</span>
                    </div>
                  }
                </label>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeModal()" [disabled]="isSubmitting()">Hủy bỏ</button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="isSubmitting() || !formData.name.trim() || !formData.categoryId || formData.price <= 0"
              >
                @if (isSubmitting()) {
                  <span class="loading-spinner"></span>
                  <span>Đang xử lý &amp; lưu...</span>
                } @else {
                  <span>{{ editingId() ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm' }}</span>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Quick Image Upload Modal -->
    @if (imageModalProduct()) {
      <div class="modal-backdrop" (click)="closeImageModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3>Cập nhật hình ảnh sản phẩm</h3>
              <div class="modal-sub">{{ imageModalProduct()?.name }}</div>
            </div>
            <button type="button" class="modal-close" (click)="closeImageModal()">&times;</button>
          </div>
          <div class="modal-body">
            @if (imageModalProduct()?.imageUrl) {
              <div class="current-image-preview-block">
                <span class="section-label">Ảnh lưu trên Cloudinary:</span>
                <div class="current-preview-wrapper">
                  <img [src]="imageModalProduct()?.imageUrl" [alt]="imageModalProduct()?.name" class="current-cloud-img" />
                </div>
              </div>
            }

            <div class="form-group" style="margin-top: 1rem;">
              <label class="form-label">Chọn tệp hình ảnh mới <span class="text-danger">*</span></label>
              <div class="file-dropzone" [class.has-file]="!!quickUploadFile">
                <input
                  type="file"
                  id="quickImageInput"
                  class="file-input-hidden"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  (change)="onQuickFileSelected($event)"
                />
                <label for="quickImageInput" class="file-dropzone-label">
                  @if (quickUploadPreview) {
                    <div class="dropzone-preview-card">
                      <img [src]="quickUploadPreview" alt="Ảnh tải lên" class="preview-img" />
                      <div class="preview-info">
                        <span class="preview-filename">{{ quickUploadFile?.name }}</span>
                        <span class="preview-filesize">{{ formatFileSize(quickUploadFile?.size || 0) }}</span>
                        <span class="upload-ready-tag">Sẵn sàng tải lên Cloudinary</span>
                      </div>
                      <button type="button" class="btn-clear-file" (click)="clearQuickFile($event)" title="Hủy chọn">&times;</button>
                    </div>
                  } @else {
                    <div class="dropzone-empty-prompt">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#495057" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <span class="prompt-text">Bấm vào đây để chọn tệp ảnh mới</span>
                      <span class="prompt-subtext">Định dạng JPG, PNG, WEBP (tối đa 5MB)</span>
                    </div>
                  }
                </label>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeImageModal()" [disabled]="isUploadingImage()">
                Đóng
              </button>
              <button
                type="button"
                class="btn btn-primary"
                [disabled]="!quickUploadFile || isUploadingImage()"
                (click)="submitQuickUpload()"
              >
                @if (isUploadingImage()) {
                  <span class="loading-spinner"></span>
                  <span>Đang tải lên Cloudinary...</span>
                } @else {
                  <span>Tải ảnh lên máy chủ</span>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- High-Resolution Image Lightbox Modal -->
    @if (previewProduct()) {
      <div class="modal-backdrop" (click)="previewProduct.set(null)">
        <div class="modal-dialog modal-preview-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3>{{ previewProduct()?.name }}</h3>
              <div class="modal-sub">
                Danh mục: {{ previewProduct()?.categoryName || 'Chưa phân loại' }}
              </div>
            </div>
            <button type="button" class="modal-close" (click)="previewProduct.set(null)">&times;</button>
          </div>
          <div class="modal-body preview-modal-body">
            <div class="preview-img-container">
              <img [src]="previewProduct()?.imageUrl" [alt]="previewProduct()?.name" class="full-preview-img" />
            </div>
            <div class="preview-details-bar">
              <div class="preview-meta-col">
                <span class="field-label">Đơn giá niêm yết:</span>
                <span class="preview-value-price">{{ previewProduct()?.price | number:'1.0-0' }} ₫</span>
              </div>
              <div class="preview-meta-col">
                <span class="field-label">Tồn kho hiện thời:</span>
                <span class="preview-value">{{ previewProduct()?.quantity }} sản phẩm</span>
              </div>
              <div class="preview-actions">
                <a [href]="previewProduct()?.imageUrl" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
                  Mở ảnh gốc
                </a>
                <button type="button" class="btn btn-primary btn-sm" (click)="switchFromPreviewToUpload()">
                  Thay đổi ảnh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

    .metric-card {
      background: #ffffff;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    }

    .metric-label {
      font-size: 0.8rem;
      color: #6c757d;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.04em;
    }

    .metric-value {
      font-size: 1.65rem;
      font-weight: 700;
      color: #1a2a3a;
      margin: 0.35rem 0;
      line-height: 1.2;
    }

    .metric-sub {
      font-size: 0.775rem;
      color: #868e96;
    }

    .text-primary { color: #1a2a3a !important; }
    .text-success { color: #198754 !important; }
    .text-warning { color: #b45309 !important; }
    .text-danger { color: #dc3545 !important; }
    .font-bold { font-weight: 700; }
    .font-medium { font-weight: 600; }

    /* Alert Banner */
    .alert {
      padding: 0.75rem 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      font-size: 0.9rem;
    }

    .alert-danger {
      background-color: #fee2e2;
      border: 1px solid #fca5a5;
      color: #991b1b;
    }

    .alert-success {
      background-color: #dcfce7;
      border: 1px solid #86efac;
      color: #166534;
    }

    .alert-warning {
      background-color: #fef3c7;
      border: 1px solid #fcd34d;
      color: #92400e;
    }

    .alert-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      line-height: 1;
      cursor: pointer;
      color: inherit;
      padding: 0 0.25rem;
    }

    .error-list {
      margin: 0.35rem 0 0 1.25rem;
      padding: 0;
    }

    /* Filter Panel */
    .filter-panel {
      background: #ffffff;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 1rem 1.25rem;
      margin-bottom: 1.25rem;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    }

    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      border-bottom: 1px solid #f1f3f5;
      padding-bottom: 0.75rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .panel-title {
      font-size: 1rem;
      color: #1a2a3a;
      font-weight: 600;
    }

    .panel-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .filter-controls-grid {
      display: grid;
      grid-template-columns: 2fr 1.5fr 1.5fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .filter-field {
      display: flex;
      flex-direction: column;
    }

    .field-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.35rem;
    }

    .input-control {
      width: 100%;
      padding: 0.45rem 0.65rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      background-color: #ffffff;
      color: #212529;
      font-size: 0.875rem;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .input-control:focus {
      border-color: #1a2a3a;
      box-shadow: 0 0 0 2px rgba(26, 42, 58, 0.15);
    }

    /* Price Filter Row */
    .price-filter-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      padding-top: 0.85rem;
      border-top: 1px solid #f1f3f5;
      flex-wrap: wrap;
    }

    .price-inputs {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .range-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .input-number {
      width: 150px;
    }

    .range-sep {
      color: #6c757d;
      font-weight: 600;
    }

    .price-presets {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
    }

    .preset-label {
      font-size: 0.8rem;
      color: #6c757d;
      font-weight: 500;
      margin-right: 0.25rem;
    }

    .preset-btn {
      padding: 0.25rem 0.55rem;
      font-size: 0.8rem;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      cursor: pointer;
      color: #495057;
      transition: all 0.15s ease;
    }

    .preset-btn:hover {
      background: #e9ecef;
      color: #212529;
    }

    .preset-btn.active {
      background: #1a2a3a;
      color: #ffffff;
      border-color: #1a2a3a;
    }

    /* Business Buttons */
    .btn {
      padding: 0.45rem 0.85rem;
      font-size: 0.875rem;
      font-weight: 500;
      border-radius: 4px;
      border: 1px solid transparent;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      text-decoration: none;
      transition: background-color 0.15s ease;
    }

    .btn-sm {
      padding: 0.35rem 0.65rem;
      font-size: 0.825rem;
    }

    .btn-primary {
      background-color: #1a2a3a;
      color: #ffffff;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #273e54;
    }

    .btn-secondary {
      background-color: #f1f3f5;
      color: #495057;
      border-color: #ced4da;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #e9ecef;
    }

    .btn-success {
      background-color: #0f766e;
      color: #ffffff;
    }

    .btn-success:hover:not(:disabled) {
      background-color: #115e59;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Data Table */
    .table-container {
      background: #ffffff;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      overflow-x: auto;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    }

    .business-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
      text-align: left;
    }

    .business-table th {
      background-color: #f8f9fa;
      color: #495057;
      font-weight: 600;
      padding: 0.75rem 1rem;
      border-bottom: 2px solid #dee2e6;
      white-space: nowrap;
    }

    .business-table td {
      padding: 0.65rem 1rem;
      border-bottom: 1px solid #e9ecef;
      color: #212529;
      vertical-align: middle;
    }

    .business-table tbody tr:hover {
      background-color: #f8f9fa;
    }

    .cell-stt {
      font-weight: 600;
      color: #495057;
      font-variant-numeric: tabular-nums;
    }

    .cell-center { text-align: center; }
    .cell-number { text-align: right; }

    /* Product Thumbnail in Table */
    .thumb-container {
      position: relative;
      width: 44px;
      height: 44px;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid #dee2e6;
      background: #f8f9fa;
      margin: 0 auto;
      cursor: pointer;
      display: inline-block;
      transition: border-color 0.15s ease, transform 0.15s ease;
    }

    .thumb-container:hover {
      border-color: #1a2a3a;
      transform: scale(1.05);
    }

    .table-thumb-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .thumb-hover-overlay {
      position: absolute;
      inset: 0;
      background: rgba(26, 42, 58, 0.45);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.15s ease;
    }

    .thumb-container:hover .thumb-hover-overlay {
      opacity: 1;
    }

    .thumb-placeholder-btn {
      width: 44px;
      height: 44px;
      border: 1px dashed #ced4da;
      border-radius: 4px;
      background: #fdfdfd;
      cursor: pointer;
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      padding: 0;
      transition: all 0.15s ease;
    }

    .thumb-placeholder-btn:hover {
      border-color: #1a2a3a;
      background: #f1f5f9;
    }

    .placeholder-caption {
      font-size: 0.6rem;
      color: #6c757d;
      font-weight: 500;
      line-height: 1;
    }

    .category-badge {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      background: #e9ecef;
      color: #495057;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .status-badge {
      display: inline-block;
      padding: 0.2rem 0.55rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .status-active {
      background-color: #e8f5e9;
      color: #1b5e20;
      border: 1px solid #c8e6c9;
    }

    .status-out_of_stock {
      background-color: #fff3e0;
      color: #b45309;
      border: 1px solid #fed7aa;
    }

    .table-actions {
      display: inline-flex;
      gap: 0.3rem;
    }

    .action-btn {
      padding: 0.25rem 0.5rem;
      font-size: 0.8rem;
      background: #ffffff;
      border: 1px solid #ced4da;
      border-radius: 3px;
      cursor: pointer;
      color: #495057;
      transition: all 0.15s ease;
    }

    .action-btn:hover {
      background: #f1f3f5;
    }

    .action-btn-accent {
      color: #0f766e;
      border-color: #99f6e4;
      background-color: #f0fdfa;
    }

    .action-btn-accent:hover {
      background-color: #ccfbf1;
      border-color: #5eead4;
    }

    .action-btn.text-danger:hover {
      background: #fee2e2;
      border-color: #fca5a5;
    }

    .loading-state,
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: #6c757d;
    }

    .loading-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid #dee2e6;
      border-top-color: #1a2a3a;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
      margin-right: 0.4rem;
      vertical-align: middle;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Table Footer & Server Pagination */
    .table-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.85rem 0.25rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .summary-text {
      font-size: 0.85rem;
      color: #6c757d;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .page-btn {
      padding: 0.35rem 0.65rem;
      font-size: 0.825rem;
      background: #ffffff;
      border: 1px solid #ced4da;
      border-radius: 4px;
      cursor: pointer;
      color: #495057;
      min-width: 34px;
      transition: all 0.15s ease;
    }

    .page-btn:hover:not(:disabled) {
      background: #f1f3f5;
      border-color: #adb5bd;
    }

    .page-btn.active {
      background: #1a2a3a;
      color: #ffffff;
      border-color: #1a2a3a;
      font-weight: 600;
    }

    .page-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    /* Modal Form */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
      padding: 1rem;
    }

    .modal-dialog {
      background: #ffffff;
      border-radius: 6px;
      width: 100%;
      max-width: 540px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8f9fa;
    }

    .modal-header h3 {
      font-size: 1.05rem;
      color: #1a2a3a;
      margin: 0;
    }

    .modal-sub {
      font-size: 0.775rem;
      color: #6c757d;
      margin-top: 0.2rem;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 1.4rem;
      cursor: pointer;
      color: #6c757d;
      line-height: 1;
    }

    .modal-body {
      padding: 1.25rem;
      overflow-y: auto;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
    }

    .form-row .col {
      flex: 1;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.25rem;
      padding-top: 0.75rem;
      border-top: 1px solid #f1f3f5;
    }

    /* File Dropzone & Image Management */
    .file-dropzone {
      position: relative;
      border: 2px dashed #ced4da;
      border-radius: 6px;
      background-color: #f8f9fa;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .file-dropzone:hover {
      border-color: #1a2a3a;
      background-color: #f1f5f9;
    }

    .file-dropzone.has-file {
      border-style: solid;
      border-color: #94a3b8;
      background-color: #ffffff;
    }

    .file-input-hidden {
      display: none;
    }

    .file-dropzone-label {
      display: block;
      padding: 1rem;
      cursor: pointer;
      margin: 0;
    }

    .dropzone-empty-prompt {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      color: #495057;
      text-align: center;
    }

    .prompt-text {
      font-size: 0.875rem;
      font-weight: 500;
      color: #1a2a3a;
    }

    .prompt-subtext {
      font-size: 0.75rem;
      color: #6c757d;
    }

    .dropzone-preview-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .preview-img {
      width: 56px;
      height: 56px;
      object-fit: cover;
      border-radius: 4px;
      border: 1px solid #dee2e6;
    }

    .preview-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .preview-filename {
      font-size: 0.85rem;
      font-weight: 600;
      color: #1a2a3a;
      word-break: break-all;
    }

    .preview-filesize {
      font-size: 0.75rem;
      color: #6c757d;
    }

    .upload-ready-tag {
      font-size: 0.7rem;
      color: #0f766e;
      font-weight: 600;
    }

    .btn-clear-file {
      background: none;
      border: none;
      font-size: 1.3rem;
      color: #dc3545;
      cursor: pointer;
      padding: 0 0.5rem;
      line-height: 1;
    }

    .existing-image-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0.75rem;
      background-color: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }

    .existing-thumb-img {
      width: 44px;
      height: 44px;
      object-fit: cover;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
    }

    .existing-meta {
      display: flex;
      flex-direction: column;
    }

    .existing-title {
      font-size: 0.8rem;
      font-weight: 600;
      color: #334155;
    }

    .existing-hint {
      font-size: 0.725rem;
      color: #64748b;
    }

    /* Quick Image Modal */
    .current-image-preview-block {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 0.75rem 1rem;
    }

    .section-label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.5rem;
    }

    .current-preview-wrapper {
      display: flex;
      justify-content: center;
    }

    .current-cloud-img {
      max-height: 160px;
      max-width: 100%;
      object-fit: contain;
      border-radius: 4px;
      border: 1px solid #ced4da;
    }

    /* Lightbox Preview Modal */
    .modal-preview-dialog {
      max-width: 680px;
    }

    .preview-modal-body {
      padding: 0;
      display: flex;
      flex-direction: column;
    }

    .preview-img-container {
      background-color: #0b1118;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 280px;
      max-height: 460px;
      overflow: hidden;
    }

    .full-preview-img {
      max-width: 100%;
      max-height: 460px;
      object-fit: contain;
      display: block;
    }

    .preview-details-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      background: #ffffff;
      border-top: 1px solid #dee2e6;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .preview-meta-col {
      display: flex;
      flex-direction: column;
    }

    .preview-value-price {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f766e;
    }

    .preview-value {
      font-size: 0.9rem;
      color: #1a2a3a;
      font-weight: 500;
    }

    @media (max-width: 900px) {
      .filter-controls-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 640px) {
      .filter-controls-grid {
        grid-template-columns: 1fr;
      }
      .price-filter-row {
        flex-direction: column;
        align-items: stretch;
      }
      .panel-actions {
        width: 100%;
        justify-content: stretch;
      }
      .panel-actions .btn {
        flex: 1;
      }
      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly platformId = inject(PLATFORM_ID);

  // Data signals
  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);
  readonly pageIndex = signal(0); // 0-indexed (Spring Data)
  pageSize = 10;

  // Filter Form State
  filterName = '';
  filterCategoryId: number | null = null;
  filterMinPrice: number | null = null;
  filterMaxPrice: number | null = null;
  filterSort = 'id,desc';

  // State indicators
  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly isUploadingImage = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly errorList = signal<string[]>([]);
  readonly successMessage = signal<string | null>(null);

  // Modal State for Add / Edit
  readonly showModal = signal(false);
  readonly editingId = signal<number | null>(null);

  formData: {
    name: string;
    price: number;
    quantity: number;
    categoryId: number | null;
    existingImageUrl?: string | null;
  } = {
    name: '',
    price: 0,
    quantity: 0,
    categoryId: null,
    existingImageUrl: null
  };

  // Add/Edit modal file state
  formSelectedFile: File | null = null;
  formFilePreview: string | null = null;

  // Quick Image Upload Modal State
  readonly imageModalProduct = signal<Product | null>(null);
  quickUploadFile: File | null = null;
  quickUploadPreview: string | null = null;

  // Image Lightbox Preview Modal
  readonly previewProduct = signal<Product | null>(null);

  // Metrics on Current Page
  readonly outOfStockOnPage = computed(() =>
    this.products().filter(p => !p.quantity || p.quantity === 0).length
  );

  readonly pageInventoryValue = computed(() =>
    this.products().reduce((sum, p) => sum + ((p.price || 0) * (p.quantity || 0)), 0)
  );

  readonly paginationInfo = computed(() => {
    const total = this.totalElements();
    if (total === 0) return { start: 0, end: 0 };
    const start = this.pageIndex() * this.pageSize + 1;
    const end = Math.min((this.pageIndex() + 1) * this.pageSize, total);
    return { start, end };
  });

  readonly pageNumberList = computed(() => {
    const total = this.totalPages();
    const current = this.pageIndex();
    const list: number[] = [];

    const start = Math.max(0, current - 2);
    const end = Math.min(total - 1, current + 2);

    for (let i = start; i <= end; i++) {
      list.push(i);
    }
    return list;
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadCategories();
      this.loadData();
    }
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (cats) => this.categories.set(cats || []),
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  loadData(): void {
    this.isLoading.set(true);
    this.clearErrors();

    const queryParams: ProductFilterParams = {
      name: this.filterName.trim() || undefined,
      categoryId: this.filterCategoryId !== null ? this.filterCategoryId : undefined,
      minPrice: this.filterMinPrice !== null ? this.filterMinPrice : undefined,
      maxPrice: this.filterMaxPrice !== null ? this.filterMaxPrice : undefined,
      page: this.pageIndex(),
      size: this.pageSize,
      sort: this.filterSort
    };

    this.productService.filter(queryParams).subscribe({
      next: (res: PageResponse<Product>) => {
        this.products.set(res.content || []);
        this.totalElements.set(res.totalElements || 0);
        this.totalPages.set(res.totalPages || 0);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.handleErrorResponse(err, 'Không thể tải danh sách sản phẩm từ máy chủ.');
      }
    });
  }

  applyFilters(): void {
    this.pageIndex.set(0);
    this.loadData();
  }

  resetFilters(): void {
    this.filterName = '';
    this.filterCategoryId = null;
    this.filterMinPrice = null;
    this.filterMaxPrice = null;
    this.filterSort = 'id,desc';
    this.pageSize = 10;
    this.pageIndex.set(0);
    this.loadData();
  }

  onPageSizeChange(): void {
    this.pageIndex.set(0);
    this.loadData();
  }

  goToPage(index: number): void {
    if (index >= 0 && index < this.totalPages() && index !== this.pageIndex()) {
      this.pageIndex.set(index);
      this.loadData();
    }
  }

  setPricePreset(min: number, max: number | null): void {
    this.filterMinPrice = min;
    this.filterMaxPrice = max;
    this.applyFilters();
  }

  isPresetActive(min: number, max: number | null): boolean {
    const curMin = this.filterMinPrice ?? 0;
    const curMax = this.filterMaxPrice;
    return curMin === min && curMax === max;
  }

  clearErrors(): void {
    this.errorMessage.set(null);
    this.errorList.set([]);
  }

  private handleErrorResponse(err: any, fallbackMessage: string): void {
    if (err?.error?.messages && Array.isArray(err.error.messages)) {
      this.errorMessage.set(err.error.error || 'Dữ liệu không hợp lệ:');
      this.errorList.set(err.error.messages);
    } else if (err?.error?.error) {
      this.errorMessage.set(err.error.error);
      this.errorList.set([]);
    } else {
      this.errorMessage.set(fallbackMessage);
      this.errorList.set([]);
    }
  }

  formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  private validateImageFile(file: File): string | null {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Định dạng tệp không được hỗ trợ. Vui lòng chọn tệp JPG, PNG hoặc WEBP.';
    }
    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxBytes) {
      return 'Kích thước tệp vượt quá 5MB. Vui lòng chọn tệp nhỏ hơn.';
    }
    return null;
  }

  // Add/Edit Form File Handling
  onFormFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const validationError = this.validateImageFile(file);
      if (validationError) {
        this.errorMessage.set(validationError);
        input.value = '';
        return;
      }
      this.formSelectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.formFilePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  clearFormFile(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.formSelectedFile = null;
    this.formFilePreview = null;
    const input = document.getElementById('formProductImage') as HTMLInputElement | null;
    if (input) input.value = '';
  }

  // Quick Image Modal Handling
  openImageUpload(product: Product): void {
    this.imageModalProduct.set(product);
    this.quickUploadFile = null;
    this.quickUploadPreview = null;
    this.clearErrors();
  }

  closeImageModal(): void {
    this.imageModalProduct.set(null);
    this.quickUploadFile = null;
    this.quickUploadPreview = null;
  }

  onQuickFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const validationError = this.validateImageFile(file);
      if (validationError) {
        this.errorMessage.set(validationError);
        input.value = '';
        return;
      }
      this.quickUploadFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.quickUploadPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  clearQuickFile(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.quickUploadFile = null;
    this.quickUploadPreview = null;
    const input = document.getElementById('quickImageInput') as HTMLInputElement | null;
    if (input) input.value = '';
  }

  submitQuickUpload(): void {
    const prod = this.imageModalProduct();
    if (!prod || !this.quickUploadFile) return;

    this.isUploadingImage.set(true);
    this.clearErrors();

    this.productService.uploadImage(prod.id, this.quickUploadFile).subscribe({
      next: (updatedProd) => {
        this.isUploadingImage.set(false);
        this.closeImageModal();
        this.successMessage.set(`Đã tải ảnh lên Cloudinary thành công cho sản phẩm "${updatedProd.name}".`);
        this.loadData();
      },
      error: (err) => {
        this.isUploadingImage.set(false);
        this.handleErrorResponse(err, 'Không thể tải ảnh lên Cloudinary. Vui lòng kiểm tra lại kết nối mạng hoặc cấu hình máy chủ.');
      }
    });
  }

  // Lightbox Preview
  openImagePreview(product: Product): void {
    this.previewProduct.set(product);
  }

  switchFromPreviewToUpload(): void {
    const prod = this.previewProduct();
    this.previewProduct.set(null);
    if (prod) {
      this.openImageUpload(prod);
    }
  }

  // CRUD Actions
  openAddModal(): void {
    this.editingId.set(null);
    const defaultCatId = this.categories().length > 0 ? this.categories()[0].id : null;
    this.formData = {
      name: '',
      price: 0,
      quantity: 1,
      categoryId: defaultCatId,
      existingImageUrl: null
    };
    this.clearFormFile();
    this.showModal.set(true);
  }

  editProduct(prod: Product): void {
    this.editingId.set(prod.id);
    const matchedCategory = this.categories().find(c => c.name === prod.categoryName);
    this.formData = {
      name: prod.name,
      price: prod.price,
      quantity: prod.quantity,
      categoryId: matchedCategory ? matchedCategory.id : (this.categories()[0]?.id ?? null),
      existingImageUrl: prod.imageUrl || null
    };
    this.clearFormFile();
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.clearFormFile();
  }

  saveProduct(e: Event): void {
    e.preventDefault();
    if (!this.formData.name.trim() || !this.formData.categoryId || this.formData.price <= 0) {
      return;
    }

    const payload: ProductRequest = {
      name: this.formData.name.trim(),
      price: Number(this.formData.price),
      quantity: Number(this.formData.quantity),
      categoryId: Number(this.formData.categoryId)
    };

    this.isSubmitting.set(true);
    const editId = this.editingId();
    const fileToUpload = this.formSelectedFile;

    if (editId) {
      this.productService.update(editId, payload).subscribe({
        next: (updatedProd) => {
          if (fileToUpload) {
            this.productService.uploadImage(editId, fileToUpload).subscribe({
              next: () => {
                this.isSubmitting.set(false);
                this.closeModal();
                this.successMessage.set(`Đã cập nhật sản phẩm "${payload.name}" và ảnh mới thành công.`);
                this.loadData();
              },
              error: (err) => {
                this.isSubmitting.set(false);
                this.closeModal();
                this.handleErrorResponse(err, 'Cập nhật thông tin thành công nhưng tải ảnh thất bại.');
                this.loadData();
              }
            });
          } else {
            this.isSubmitting.set(false);
            this.closeModal();
            this.successMessage.set(`Đã cập nhật sản phẩm "${payload.name}" thành công.`);
            this.loadData();
          }
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.handleErrorResponse(err, 'Cập nhật sản phẩm thất bại.');
        }
      });
    } else {
      this.productService.create(payload).subscribe({
        next: (created) => {
          if (fileToUpload) {
            this.productService.uploadImage(created.id, fileToUpload).subscribe({
              next: () => {
                this.isSubmitting.set(false);
                this.closeModal();
                this.successMessage.set(`Đã tạo mới sản phẩm "${created.name}" kèm ảnh Cloudinary thành công.`);
                this.loadData();
              },
              error: (err) => {
                this.isSubmitting.set(false);
                this.closeModal();
                this.handleErrorResponse(err, 'Đã tạo sản phẩm nhưng tải ảnh lên Cloudinary thất bại.');
                this.loadData();
              }
            });
          } else {
            this.isSubmitting.set(false);
            this.closeModal();
            this.successMessage.set(`Đã tạo mới sản phẩm "${created.name}" thành công.`);
            this.loadData();
          }
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.handleErrorResponse(err, 'Thêm sản phẩm mới thất bại.');
        }
      });
    }
  }

  deleteProduct(prod: Product): void {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${prod.name}" khỏi hệ thống?`)) {
      return;
    }

    this.productService.delete(prod.id).subscribe({
      next: () => {
        this.successMessage.set(`Đã xóa sản phẩm "${prod.name}" thành công.`);
        this.loadData();
      },
      error: (err) => {
        this.handleErrorResponse(err, 'Không thể xóa sản phẩm. Vui lòng thử lại sau.');
      }
    });
  }
}
