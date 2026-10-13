import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModuleNavComponent } from '../../shared/module-nav/module-nav.component';
import { CategoryService } from '../../core/services/category.service';
import { Category, CategoryRequest } from '../../core/models/category.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ModuleNavComponent],
  template: `
    <app-module-nav [categoryCount]="categories().length"></app-module-nav>

    <!-- KPI Summary Card -->
    <section class="kpi-grid" aria-label="Thống kê tổng quan danh mục">
      <div class="kpi-card">
        <span class="kpi-label">Tổng danh mục</span>
        <span class="kpi-value">{{ categories().length }}</span>
        <span class="kpi-note">Đang quản lý trong hệ thống</span>
      </div>
    </section>

    <!-- Error / Success Feedback -->
    @if (errorMessage()) {
      <div class="alert alert-danger">
        <span>{{ errorMessage() }}</span>
        <button class="alert-close" (click)="errorMessage.set(null)">&times;</button>
      </div>
    }
    @if (successMessage()) {
      <div class="alert alert-success">
        <span>{{ successMessage() }}</span>
        <button class="alert-close" (click)="successMessage.set(null)">&times;</button>
      </div>
    }

    <!-- Action & Filter Bar -->
    <section class="action-panel">
      <div class="search-filter-group">
        <div class="search-box">
          <input
            type="text"
            [ngModel]="searchTerm()"
            (ngModelChange)="searchTerm.set($event)"
            placeholder="Tìm theo tên hoặc mã danh mục..."
            aria-label="Tìm kiếm danh mục"
          />
        </div>
      </div>

      <div class="btn-group">
        <button class="btn btn-primary" (click)="openAddModal()">
          + Thêm danh mục
        </button>
      </div>
    </section>

    <!-- Data Table -->
    <section class="table-container" aria-label="Danh sách danh mục">
      <table class="business-table">
        <thead>
          <tr>
            <th style="width: 80px;" class="cell-center">STT</th>
            <th style="width: 120px;">Mã danh mục</th>
            <th>Tên danh mục</th>
            <th style="width: 160px; text-align: center;">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          @if (isLoading()) {
            <tr>
              <td colspan="4" class="loading-state">Đang tải dữ liệu từ máy chủ...</td>
            </tr>
          } @else if (filteredCategories().length === 0) {
            <tr>
              <td colspan="4" class="empty-state">
                {{ searchTerm() ? 'Không tìm thấy danh mục nào phù hợp.' : 'Chưa có danh mục nào trong hệ thống.' }}
              </td>
            </tr>
          } @else {
            @for (cat of filteredCategories(); track cat.id; let i = $index) {
              <tr>
                <td class="cell-center cell-code">{{ i + 1 }}</td>
                <td class="cell-code">#{{ cat.id }}</td>
                <td class="cell-name">{{ cat.name }}</td>
                <td class="cell-center">
                  <div class="table-actions">
                    <button class="action-btn" (click)="editCategory(cat)" title="Chỉnh sửa">
                      Sửa
                    </button>
                    <button class="action-btn text-danger" (click)="deleteCategory(cat)" title="Xóa">
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

    <!-- Modal Form (Add / Edit) -->
    @if (showModal()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingId() ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới' }}</h3>
            <button class="modal-close" (click)="closeModal()">&times;</button>
          </div>
          <form class="modal-body" (submit)="saveCategory($event)">
            <div class="form-group">
              <label>Tên danh mục <span class="text-danger">*</span></label>
              <input
                type="text"
                [(ngModel)]="formData.name"
                name="name"
                placeholder="Nhập tên danh mục..."
                required
                autofocus
              />
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Hủy</button>
              <button type="submit" class="btn btn-primary" [disabled]="isSubmitting() || !formData.name.trim()">
                {{ isSubmitting() ? 'Đang lưu...' : 'Lưu danh mục' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

    .kpi-card {
      background: #ffffff;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    }

    .kpi-label {
      font-size: 0.825rem;
      color: #6c757d;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.03em;
    }

    .kpi-value {
      font-size: 1.65rem;
      font-weight: 700;
      color: #1a2a3a;
      margin: 0.35rem 0;
      line-height: 1.2;
    }

    .kpi-note {
      font-size: 0.775rem;
      color: #868e96;
    }

    .action-panel {
      background: #ffffff;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 0.85rem 1rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .search-filter-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
      min-width: 280px;
    }

    .search-box {
      flex: 1;
      min-width: 220px;
    }

    .search-box input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      background-color: #fff;
      color: #212529;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.15s ease;
    }

    .search-box input:focus {
      border-color: #1a2a3a;
      box-shadow: 0 0 0 1px #1a2a3a;
    }

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
      text-align: left;
      font-size: 0.9rem;
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
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e9ecef;
      color: #212529;
      vertical-align: middle;
    }

    .business-table tbody tr:hover {
      background-color: #f8f9fa;
    }

    .cell-code {
      font-family: SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 600;
      color: #1a2a3a;
    }

    .cell-name {
      font-weight: 500;
    }

    .cell-center {
      text-align: center;
    }

    .table-actions {
      display: inline-flex;
      gap: 0.35rem;
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
      background-color: #f1f3f5;
      border-color: #adb5bd;
    }

    .action-btn.text-danger:hover {
      background-color: #fff5f5;
      border-color: #dc3545;
    }

    .alert {
      padding: 0.75rem 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
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

    .alert-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      line-height: 1;
      cursor: pointer;
      color: inherit;
    }

    .loading-state,
    .empty-state {
      text-align: center;
      padding: 2.5rem 1rem;
      color: #6c757d;
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
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
      max-width: 480px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      overflow: hidden;
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
      font-size: 1.1rem;
      color: #1a2a3a;
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
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.4rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .form-group input {
      width: 100%;
      padding: 0.55rem 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 0.9rem;
      box-sizing: border-box;
      outline: none;
    }

    .form-group input:focus {
      border-color: #1a2a3a;
      box-shadow: 0 0 0 1px #1a2a3a;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }
  `]
})
export class CategoryListComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly categories = signal<Category[]>([]);
  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly searchTerm = signal('');
  readonly showModal = signal(false);
  readonly editingId = signal<number | null>(null);

  formData: CategoryRequest = {
    name: ''
  };

  readonly filteredCategories = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.categories();
    return this.categories().filter(c =>
      c.name.toLowerCase().includes(term) || c.id.toString().includes(term)
    );
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadCategories();
    }
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories.set(data || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Không thể tải danh sách danh mục từ Backend. Vui lòng kiểm tra kết nối.');
        console.error('Failed to load categories', err);
      }
    });
  }

  openAddModal(): void {
    this.editingId.set(null);
    this.formData = { name: '' };
    this.showModal.set(true);
  }

  editCategory(cat: Category): void {
    this.editingId.set(cat.id);
    this.formData = { name: cat.name };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveCategory(e: Event): void {
    e.preventDefault();
    const name = this.formData.name.trim();
    if (!name) return;

    this.isSubmitting.set(true);
    const editId = this.editingId();

    if (editId) {
      this.categoryService.update(editId, { name }).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.successMessage.set(`Đã cập nhật danh mục thành công.`);
          this.loadCategories();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set('Cập nhật danh mục thất bại.');
          console.error('Update category failed', err);
        }
      });
    } else {
      this.categoryService.create({ name }).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.successMessage.set(`Đã thêm danh mục mới thành công.`);
          this.loadCategories();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set('Thêm danh mục mới thất bại.');
          console.error('Create category failed', err);
        }
      });
    }
  }

  deleteCategory(cat: Category): void {
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${cat.name}"?`)) {
      return;
    }

    this.categoryService.delete(cat.id).subscribe({
      next: () => {
        this.successMessage.set(`Đã xóa danh mục "${cat.name}".`);
        this.loadCategories();
      },
      error: (err) => {
        this.errorMessage.set('Không thể xóa danh mục này (có thể danh mục đang chứa sản phẩm liên kết).');
        console.error('Delete category failed', err);
      }
    });
  }
}
