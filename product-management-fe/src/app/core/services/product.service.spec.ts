import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { PageResponse, Product, ProductRequest } from '../models/product.model';

describe('ProductService', () => {
  let service: ProductService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ProductService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all products', () => {
    const mockProducts: Product[] = [
      { id: 1, name: 'iPhone 15', price: 20000000, quantity: 10, categoryName: 'Điện thoại' }
    ];

    service.getAll().subscribe(prods => {
      expect(prods.length).toBe(1);
      expect(prods[0].name).toBe('iPhone 15');
    });

    const req = httpTesting.expectOne('http://localhost:8080/api/products');
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });

  it('should create a product', () => {
    const payload: ProductRequest = {
      name: 'MacBook Air',
      price: 25000000,
      quantity: 5,
      categoryId: 1
    };
    const response: Product = {
      id: 2,
      name: 'MacBook Air',
      price: 25000000,
      quantity: 5,
      categoryName: 'Điện thoại'
    };

    service.create(payload).subscribe(res => {
      expect(res.id).toBe(2);
      expect(res.name).toBe('MacBook Air');
    });

    const req = httpTesting.expectOne('http://localhost:8080/api/products');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(response);
  });

  it('should search products by keyword', () => {
    const mockResults: Product[] = [
      { id: 1, name: 'iPhone 15', price: 20000000, quantity: 10, categoryName: 'Điện thoại' }
    ];

    service.search('iPhone').subscribe(res => {
      expect(res.length).toBe(1);
    });

    const req = httpTesting.expectOne('http://localhost:8080/api/products/search?q=iPhone');
    expect(req.request.method).toBe('GET');
    req.flush(mockResults);
  });

  it('should filter products with pagination and sorting', () => {
    const mockPage: PageResponse<Product> = {
      content: [
        { id: 1, name: 'iPhone 15', price: 20000000, quantity: 10, categoryName: 'Điện thoại' }
      ],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0,
      first: true,
      last: true,
      empty: false,
      numberOfElements: 1
    };

    service.filter({ name: 'iPhone', page: 0, size: 10, sort: 'price,asc' }).subscribe(res => {
      expect(res.totalElements).toBe(1);
      expect(res.content.length).toBe(1);
      expect(res.content[0].name).toBe('iPhone 15');
    });

    const req = httpTesting.expectOne(request =>
      request.url === 'http://localhost:8080/api/products/filter' &&
      request.params.get('name') === 'iPhone' &&
      request.params.get('sort') === 'price,asc'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);
  });

  it('should upload product image', () => {
    const mockFile = new File(['fake content'], 'test.png', { type: 'image/png' });
    const response: Product = {
      id: 1,
      name: 'iPhone 15',
      price: 20000000,
      quantity: 10,
      categoryName: 'Điện thoại',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg'
    };

    service.uploadImage(1, mockFile).subscribe(res => {
      expect(res.imageUrl).toBe('https://res.cloudinary.com/demo/image/upload/sample.jpg');
    });

    const req = httpTesting.expectOne('http://localhost:8080/api/products/1/image');
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush(response);
  });
});
