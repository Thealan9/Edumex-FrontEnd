import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { Auth } from './auth';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    if (req.url.includes('/login') || req.url.includes('/register')) {
      return next.handle(req);
    }

    return this.auth.getToken$().pipe(
      take(1),
      switchMap(token => {

        const authReq = token
          ? req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            })
          : req;

        return next.handle(authReq).pipe(
          catchError((error: HttpErrorResponse) => {

            if ((error.status === 401 || error.status === 403) && token) {
              this.auth.logout();
              this.auth.clearUser();
              this.router.navigateByUrl('/login', { replaceUrl: true });
            }

            return throwError(() => error);
          })
        );
      })
    );
  }
}
