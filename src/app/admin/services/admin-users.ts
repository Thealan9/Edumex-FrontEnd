import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, tap } from 'rxjs';
import { UpdateUserResponse } from 'src/app/interfaces/admin/update-user.interface';
import { User } from 'src/app/interfaces/admin/user.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminUsers {

  private API = environment.apiUrl;
  private _refresh = new Subject<void>();
  refresh$ = this._refresh.asObservable();

  constructor(private http: HttpClient) {}

  getUsers(){
    return this.http.get<User[]>(`${this.API}/admin/users`);
  }

  loadWarehousemen() {
    return this.http.get<any>(`${this.API}/admin/warehousemen-list`);
  }
  getUser(id: number) {
    return this.http.get<User>(`${this.API}/admin/users/${id}`);
  }

  createUser(data: Partial<User>) {
      return this.http.post<any>(`${this.API}/admin/users`, data).pipe(
      tap( ()=> this.triggerRefresh())
    );
  }

  updateUser(id: number, data: Partial<User>) {
    return this.http.put<UpdateUserResponse>(`${this.API}/admin/users/${id}`,data).pipe(
      tap(()=> this.triggerRefresh())
    );
  }

  updatePassword(id: number, data: Partial<any>) {
    return this.http.put<any>(`${this.API}/admin/users/${id}/change-password`,data);
  }

  triggerRefresh(){
    this._refresh.next();
  }

  deleteUser(id: number) {
  return this.http.delete<any>(`${this.API}/admin/users/${id}`);
  }

  toggleActive(id: number) {
  return this.http.patch<any>(`${this.API}/admin/users/${id}/toggle-active`, {});
  }

}
