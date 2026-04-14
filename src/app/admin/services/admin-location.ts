import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, Subject, tap } from 'rxjs';
import {Auth} from "../../core/auth";

export interface Location {
  id?: number;
  code: string;
  max_capacity: number;
  current_capacity: number;
  active:boolean;
  created_at?: string;
  current_stock?: number;
}
@Injectable({
  providedIn: 'root',
})
export class AdminLocation {
  private API = `${environment.apiUrl}/admin/locations`;
  private _refresh = new Subject<void>();
  refresh$ = this._refresh.asObservable();

  private get baseUrl() {
    const user = this.auth.currentUserValue;
    const role = user?.role || 'user';

    if (role === 'warehouseman') {
      return `${environment.apiUrl}/warehouseman/locations`;
    }
    return `${environment.apiUrl}/admin/locations`;
  }

  constructor(private http: HttpClient,private auth: Auth) {}

  getLocations(): Observable<{success: boolean, data: Location[]}> {
    return this.http.get<{success: boolean, data: Location[]}>(this.baseUrl);
  }

  storeLocation(location: Location): Observable<any> {
    return this.http.post(this.baseUrl, location).pipe(
      tap(() => this._refresh.next())
    );
  }

  updateLocation(id: number, location: Partial<Location>): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, location).pipe(
      tap(() => this._refresh.next())
    );
  }

  deleteLocation(id: number) {{
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      tap(() => this._refresh.next())
    );
  }}
}
