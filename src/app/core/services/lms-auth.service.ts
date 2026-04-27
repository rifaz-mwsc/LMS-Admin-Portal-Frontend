import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { LmsTokenResponse } from '../models/lms-session.model';

const SESSION_KEY = 'lms_session';

@Injectable({ providedIn: 'root' })
export class LmsAuthService {

  private _session$ = new BehaviorSubject<LmsTokenResponse | null>(this.getSession());

  constructor(private http: HttpClient, private router: Router) {}

  // ─── Session helpers ──────────────────────────────────────────────────────

  getSession(): LmsTokenResponse | null {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  saveSession(session: LmsTokenResponse): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this._session$.next(session);
  }

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
    this._session$.next(null);
  }

  isLoggedIn(): boolean {
    const session = this.getSession();
    if (!session) return false;
    return new Date(session.access_token_expires_on) > new Date();
  }

  getAccessToken(): string | null {
    return this.getSession()?.access_token ?? null;
  }

  getRefreshToken(): string | null {
    return this.getSession()?.refresh_token ?? null;
  }

  get session$() {
    return this._session$.asObservable();
  }

  // ─── 1. Domain credentials login ─────────────────────────────────────────

  loginWithDomainCredentials(username: string, password: string): Observable<LmsTokenResponse> {
    const formData = new FormData();
    formData.append('domain_username', username);
    formData.append('domain_password', password);
    formData.append('device', environment.device);
    formData.append('client', environment.client);

    return this.http
      .post<LmsTokenResponse>(
        `${environment.apiUrl}/auth/login-using-domain-credentials`,
        formData
      )
      .pipe(
        tap(res => this.saveSession(res)),
        catchError(err => throwError(() => err))
      );
  }

  // ─── 2. MSAL Azure token → portal token ───────────────────────────────────

  loginWithAzureToken(azureToken: string): Observable<LmsTokenResponse> {
    const body = {
      azure_token: azureToken,
      device: environment.device,
      client: environment.client
    };

    return this.http
      .post<LmsTokenResponse>(
        `${environment.apiUrl}/auth/login-using-azure-msal`,
        body,
        { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
      )
      .pipe(
        tap(res => this.saveSession(res)),
        catchError(err => throwError(() => err))
      );
  }

  // ─── 3. Refresh token ─────────────────────────────────────────────────────

  refreshAccessToken(): Observable<LmsTokenResponse> {
    const session = this.getSession();
    if (!session) {
      return throwError(() => new Error('No session'));
    }

    const body = {
      access_token: session.access_token,
      refresh_token: session.refresh_token
    };

    return this.http
      .post<LmsTokenResponse>(
        `${environment.apiUrl}/auth/login-using-refresh-token`,
        body,
        { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
      )
      .pipe(
        tap(res => this.saveSession(res)),
        catchError(err => throwError(() => err))
      );
  }

  // ─── Logout ───────────────────────────────────────────────────────────────

  logout(): void {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }
}
