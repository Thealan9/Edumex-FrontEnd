import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {Subject, tap} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {User} from "../../interfaces/admin/user.model";
import {UpdateUserResponse} from "../../interfaces/admin/update-user.interface";

@Injectable({
  providedIn: 'root',
})
export class Users {
  private API = environment.apiUrl;
  private _refresh = new Subject<void>();
  refresh$ = this._refresh.asObservable();

  constructor(private http: HttpClient) {}
  updateUser(id: number, data: Partial<User>) {
    return this.http.put<UpdateUserResponse>(`${this.API}/user/users/${id}`,data).pipe(
      tap(()=> this.triggerRefresh())
    );
  }

  updatePassword(id: number, data: Partial<any>) {
    return this.http.put<any>(`${this.API}/user/users/${id}/change-password`,data);
  }

  triggerRefresh(){
    this._refresh.next();
  }
}
