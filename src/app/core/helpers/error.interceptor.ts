import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        // Extract LMS API error_message if present, fall back to statusText
        const errorBody = err.error;
        const message =
          errorBody?.error_message ||
          errorBody?.message ||
          err.statusText ||
          'An unexpected error occurred';
        return throwError(() => ({ message, raw: err }));
      })
    );
  }
}

