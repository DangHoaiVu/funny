import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse, Product, ProductFilterParams, ProductRequest } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/products';

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  create(req: ProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, req);
  }

  update(id: number, req: ProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadImage(id: number, file: File): Observable<Product> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Product>(`${this.apiUrl}/${id}/image`, formData);
  }

  search(keyword: string): Observable<Product[]> {
    const params = new HttpParams().set('q', keyword);
    return this.http.get<Product[]>(`${this.apiUrl}/search`, { params });
  }

  filter(filterParams: ProductFilterParams): Observable<PageResponse<Product>> {
    let params = new HttpParams();

    if (filterParams.name && filterParams.name.trim()) {
      params = params.set('name', filterParams.name.trim());
    }
    if (filterParams.categoryId !== undefined && filterParams.categoryId !== null) {
      params = params.set('categoryId', filterParams.categoryId.toString());
    }
    if (filterParams.minPrice !== undefined && filterParams.minPrice !== null) {
      params = params.set('minPrice', filterParams.minPrice.toString());
    }
    if (filterParams.maxPrice !== undefined && filterParams.maxPrice !== null) {
      params = params.set('maxPrice', filterParams.maxPrice.toString());
    }
    if (filterParams.page !== undefined && filterParams.page !== null) {
      params = params.set('page', filterParams.page.toString());
    }
    if (filterParams.size !== undefined && filterParams.size !== null) {
      params = params.set('size', filterParams.size.toString());
    }
    if (filterParams.sort) {
      params = params.set('sort', filterParams.sort);
    }

    return this.http.get<PageResponse<Product>>(`${this.apiUrl}/filter`, { params });
  }
}
