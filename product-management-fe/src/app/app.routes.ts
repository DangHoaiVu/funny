import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { ClientLayoutComponent } from './layouts/client-layout/client-layout.component';
import { ProductListComponent } from './features/products/product-list.component';
import { CategoryListComponent } from './features/categories/category-list.component';
import { ShopProductListComponent } from './features/shop/shop-product-list.component';
import { adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // 1. Tuyến đường Xác thực (Auth)
  {
    path: 'login',
    component: LoginComponent,
    title: 'Đăng nhập - Product Management System'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Đăng ký tài khoản - PrimeStore'
  },

  // 2. Tuyến đường Khách hàng / Mua sắm (Bọc bởi ClientLayoutComponent)
  {
    path: 'shop',
    component: ClientLayoutComponent,
    children: [
      {
        path: '',
        component: ShopProductListComponent,
        title: 'Cửa hàng Sản phẩm - PrimeStore'
      }
    ]
  },

  // 3. Tuyến đường Quản trị Doanh nghiệp (Bọc bởi AdminLayoutComponent & bảo vệ bởi adminGuard)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'products',
        pathMatch: 'full'
      },
      {
        path: 'products',
        component: ProductListComponent,
        title: 'Quản lý Sản phẩm - PMS Admin'
      },
      {
        path: 'categories',
        component: CategoryListComponent,
        title: 'Quản lý Danh mục - PMS Admin'
      }
    ]
  },

  // 4. Tuyến đường tương thích & Mặc định
  {
    path: 'products',
    redirectTo: 'shop',
    pathMatch: 'full'
  },
  {
    path: 'categories',
    redirectTo: 'admin/categories',
    pathMatch: 'full'
  },
  {
    path: '',
    redirectTo: 'shop',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'shop'
  }
];
