import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, Subject, tap } from 'rxjs';

export interface InventoryMovement {
  id?: number;
  book_id: number;
  location_id: number;
  type: 'input' | 'output' | 'adjustment' | 'return';
  quantity: number;
  description?: string;
  created_at?: string;
  book?: any;
  location?: any;
  user?: any;
}
@Injectable({
  providedIn: 'root',
})
export class WarehouseInventory {
  private API = `${environment.apiUrl}/warehouseman/inventory`;

  private _refresh = new Subject<void>();
  refresh$ = this._refresh.asObservable();

  constructor(private http: HttpClient) {}

  getPendingPurchases(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/warehouseman/pending-purchases`);
  }
  getPendingOutputs():Observable<any>{
    return this.http.get(`${environment.apiUrl}/warehouseman/pending-outputs`);
  }

  getLocationsByBook(id:number){
    return this.http.get<any>(`${environment.apiUrl}/warehouseman/books-locations/${id}`);
  }

  registerMovement(movement: any): Observable<any> {
    return this.http.post(`${this.API}/move`, movement).pipe(
      tap(() => this._refresh.next())
    );
  }

  getMyMovements(page: number = 1, userId?: number): Observable<any> {
    let url = `${this.API}/history?page=${page}`;
    if (userId) {
      url += `&user_id=${userId}`;
    }
    return this.http.get(url);
  }
}
