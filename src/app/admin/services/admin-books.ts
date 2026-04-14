import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, Subject, tap } from 'rxjs';
import { Auth } from 'src/app/core/auth';

export interface Book {
  id?: number;
  title: string;
  isbn: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  price_unit: number;
  units_per_package: number;
  price_package?: number;
  stock_alert?: number;
  autor: string;
  active: boolean;
  pages: number;
  year: number;
  edition: number;
  format: 'Bolsillo' | 'Tapa Blanda' | 'Tapa Dura';
  size: string;
  supplier: string;
  total_stock?: number;
  image_url?: string;
  image_path?: string;
  category: string;
  type?: string;
}

export interface Ebook {
  id?: number;
  title: string;
  isbn: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  price: number;
  autor: string;
  active: boolean;
  pages: number;
  year: number;
  edition: number;
  supplier: string;
  category: string;
  description?: string;
  image_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminBooks {
  private _refresh = new Subject<void>();
  refresh$ = this._refresh.asObservable();
  private get baseUrl() {
    const user = this.auth.currentUserValue;
    const role = user?.role || 'user';

    if (role === 'admin') {
      return `${environment.apiUrl}/admin/books`;
    } else if (role === 'warehouseman') {
      return `${environment.apiUrl}/warehouseman/books`;
    } else {
      return `${environment.apiUrl}/catalog`;
    }
  }

  constructor(private http: HttpClient, private auth: Auth,) {}

  getBooks(search?: string,page: number = 1): Observable<{success: boolean, data: Book[]}> {
    let params = new HttpParams().set('page', page.toString());
    if (search) params = params.set('search', search);
    return this.http.get<{success: boolean, data: Book[]}>(this.baseUrl, { params });
  }

  getBookNameId():Observable<any> {
    return this.http.get(`${this.baseUrl}/nameBooks`,);
  }

  storeBook(book: FormData): Observable<any> {
    return this.http.post(this.baseUrl, book).pipe(
      tap(() => this._refresh.next())
    );
  }

  updateBook(id: number, formData: FormData): Observable<any> {
    formData.append('_method', 'PUT');
    return this.http.post(`${this.baseUrl}/${id}`, formData).pipe(
      tap(() => this._refresh.next())
    );
  }

  getBookById(id: number, type: string = 'physical'): Observable<any> {
    const params = new HttpParams().set('type', type);
    return this.http.get<any>(`${this.baseUrl}/${id}`, { params });
  }
  deleteBook(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      tap(() => this._refresh.next())
    );
  }

  getLocationsByBook(id:number){
    return this.http.get<any>(`${environment.apiUrl}/admin/books-locations/${id}`);
  }
  uploadImage(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post(`${environment.apiUrl}/admin/books/${id}/image`, formData).pipe(
      tap(() => this._refresh.next())
    );
  }

  findBookForMovement(id: number): Observable<{success: boolean, data: Book}> {
    return this.http.get<{success: boolean, data: Book}>(
      `${environment.apiUrl}/warehouseman/books/find-for-movement/${id}`
    );
  }


  // Ebooks CRUD
  getEbooks(search?: string, page: number = 1): Observable<any> {
    let params = new HttpParams().set('page', page.toString());
    if (search) params = params.set('search', search);
    return this.http.get<any>(`${environment.apiUrl}/admin/ebooks`, { params });
  }

  storeEbook(formData: FormData): Observable<any> {
    return this.http.post(`${environment.apiUrl}/admin/ebooks`, formData).pipe(
      tap(() => this._refresh.next())
    );
  }

  updateEbook(id: number, formData: FormData): Observable<any> {
    formData.append('_method', 'PUT');
    return this.http.post(`${environment.apiUrl}/admin/ebooks/${id}`, formData).pipe(
      tap(() => this._refresh.next())
    );
  }

  deleteEbook(id:number){
    return this.http.delete(`${environment.apiUrl}/admin/ebooks/${id}`).pipe(
      tap(() => this._refresh.next())
    );
  }

  toggleEbookStatus(id: number): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/admin/ebooks/${id}/status`, {});
  }
  toggleBookStatus(id: number): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/admin/books/${id}/status`, {});
  }

}
