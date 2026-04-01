import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { filter, switchMap, take, tap } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { User } from '../interfaces/admin/user.model';
@Injectable({
  providedIn: 'root',
})
export class Auth {
  private API = environment.apiUrl;
  private TOKEN_KEY = 'token';

  private _ready = new BehaviorSubject<boolean>(false);
  private _user = new BehaviorSubject<any | null>(null);
  user$ = this._user.asObservable();
  constructor(private http: HttpClient, private storage: Storage) {
    this.init();
  }

  private async init() {
    await this.storage.create();
    this._ready.next(true);
    const token = await this.storage.get(this.TOKEN_KEY);
    if (token) {
      this.loadUserFromApi().catch(err => {
        console.warn('Sesión expirada o token inválido al arrancar');
        this.clearUser();
      });
    }
  }

  private storageReady$(): Observable<boolean> {
    return this._ready.asObservable().pipe(filter((ready) => ready === true));
  }

  getToken$(): Observable<string | null> {
    return this.storageReady$().pipe(
      switchMap(() => from(this.storage.get(this.TOKEN_KEY)))
    );
  }

  async getToken(): Promise<string | null> {
    await firstValueFrom(this.storageReady$().pipe(take(1)));
    return this.storage.get(this.TOKEN_KEY);
  }

  async saveToken(token: string) {
    await this.storage.set(this.TOKEN_KEY, token);
  }

  async logout() {
    await this.storage.remove(this.TOKEN_KEY);
  }

  login(data: { email: string; password: string }) {
    return this.http.post<any>(`${this.API}/login`, data).pipe(
      tap(async (res) => {
        const token = res.token;
        const user = res.user;

        await this.saveToken(token);
        this._user.next(user);
      })
    );
  }

  logoutApi() {
    return this.http.post(`${this.API}/logout`, {});
  }

  yo() {
    return this.http.get(`${this.API}/yo`);
  }

  async getUser(): Promise<User | null> {
    if (this._user.value) return this._user.value;

    const token = await this.getToken();
    if (token) {
      try {
        const user = await this.loadUserFromApi();
        return user;
      } catch (e) {
        console.error('Error cargando usuario', e);
        return null;
      }
    }
    return null;
  }

  async loadUserFromApi(): Promise<any | null> {
    try {
      const user = await firstValueFrom(this.yo().pipe(take(1)));
      this._user.next(user);
      return user;
    } catch (error) {
      this._user.next(null);
      await this.logout();
      return null;
    }
  }

  setUser(user: any) {
    this._user.next(user);
  }

  clearUser() {
    this._user.next(null);
  }
  get currentUserValue() {
    return this._user.value;
  }
}
