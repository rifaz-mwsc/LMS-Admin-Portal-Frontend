import { Injectable } from '@angular/core';
import {
  HttpRequest, HttpHandler, HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';

import { LmsAuthService } from '../services/lms-auth.service';
import { environment } from '../../../environments/environment';

// Auth endpoints that must NOT carry a token (would cause infinite loops)
const AUTH_ENDPOINTS = [
  '/auth/login-using-domain-credentials',
  '/auth/login-using-azure-msal',
  '/auth/login-using-refresh-token'
];

// External domains — send requests as-is, preserving their own auth headers
const EXTERNAL_DOMAINS = [
  'app.asana.com',
  'login.microsoftonline.com',
  'graph.microsoft.com'
];

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshToken$ = new BehaviorSubject<string | null>(null);

  constructor(private lmsAuth: LmsAuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip auth endpoints (infinite loop prevention)
    const isAuthUrl = AUTH_ENDPOINTS.some(ep => request.url.includes(ep));
    if (isAuthUrl) {
      return next.handle(request);
    }

    // Skip external domains — they manage their own Authorization headers
    const isExternal = EXTERNAL_DOMAINS.some(domain => request.url.includes(domain));
    if (isExternal) {
      return next.handle(request);
    }

    // Attach portal Bearer token
    const token = this.lmsAuth.getAccessToken();
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  private handle401(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshToken$.next(null);

      return this.lmsAuth.refreshAccessToken().pipe(
        switchMap(session => {
          this.isRefreshing = false;
          this.refreshToken$.next(session.access_token);
          return next.handle(this.addToken(request, session.access_token));
        }),
        catchError(err => {
          this.isRefreshing = false;
          this.lmsAuth.logout();
          return throwError(() => err);
        })
      );
    }

    // Queue concurrent requests until refresh completes
    return this.refreshToken$.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next.handle(this.addToken(request, token!)))
    );
  }
}

