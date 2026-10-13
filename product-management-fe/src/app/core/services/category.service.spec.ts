import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CategoryService } from './category.service';
import { Category } from '../models/category.model';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CategoryService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(CategoryService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all categories', () => {
    const mockCategories: Category[] = [
      { id: 1, name: 'Điện thoại' },
      { id: 2, name: 'Laptop' }
    ];

    service.getAll().subscribe(cats => {
      expect(cats.length).toBe(2);
      expect(cats[0].name).toBe('Điện thoại');
    });

    const req = httpTesting.expectOne('http://localhost:8080/api/categories');
    expect(req.request.method).toBe('GET');
    req.flush(mockCategories);
  });

  it('should create a category', () => {
    const newCat = { name: 'Phụ kiện' };
    const createdCat: Category = { id: 3, name: 'Phụ kiện' };

    service.create(newCat).subscribe(res => {
      expect(res.id).toBe(3);
      expect(res.name).toBe('Phụ kiện');
    });

    const req = httpTesting.expectOne('http://localhost:8080/api/categories');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newCat);
    req.flush(createdCat);
  });
});
