export interface Product {
  id: number;
  name: string;
  imageUrl?: string | null;
  price: number;
  quantity: number;
  categoryName: string;
}

export interface ProductRequest {
  name: string;
  price: number;
  quantity: number;
  categoryId: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
}

export interface ProductFilterParams {
  name?: string;
  categoryId?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  page?: number;
  size?: number;
  sort?: string;
}
