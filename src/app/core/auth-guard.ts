import { Injectable } from '@angular/core';
import {  CanMatch , Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanMatch  {

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  canMatch(): Observable<boolean | UrlTree> {
    return this.auth.getToken$().pipe(
      take(1),
      map(token => {

        return token
          ? true
          : this.router.createUrlTree(['/login']);
      })
    );
  }
}
