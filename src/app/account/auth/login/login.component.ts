import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { EventMessage, EventType, InteractionStatus } from '@azure/msal-browser';

import { LmsAuthService } from '../../../core/services/lms-auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  domainForm!: UntypedFormGroup;
  submitted = false;
  error = '';
  loading = false;
  fieldTextType = false;
  activeTab: 'domain' | 'msal' = 'domain';

  year = new Date().getFullYear();

  private destroy$ = new Subject<void>();

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private lmsAuth: LmsAuthService,
    private msalService: MsalService,
    private msalBroadcast: MsalBroadcastService
  ) {}

  ngOnInit(): void {
    if (this.lmsAuth.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    this.domainForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    // Handle MSAL popup result
    this.msalBroadcast.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
        takeUntil(this.destroy$)
      )
      .subscribe((msg: EventMessage) => {
        const result = msg.payload as any;
        const azureToken = result?.accessToken || result?.idToken;
        if (azureToken) {
          this.exchangeAzureToken(azureToken);
        }
      });

    this.msalBroadcast.inProgress$
      .pipe(
        filter(status => status === InteractionStatus.None),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  get f() { return this.domainForm.controls; }

  // ─── Domain login ──────────────────────────────────────────────────────────

  onDomainSubmit(): void {
    this.submitted = true;
    this.error = '';
    if (this.domainForm.invalid) return;

    this.loading = true;
    this.lmsAuth.loginWithDomainCredentials(
      this.f['username'].value,
      this.f['password'].value
    ).pipe(takeUntil(this.destroy$))
     .subscribe({
       next: () => this.router.navigate(['/']),
       error: err => {
         this.error = err?.message || 'Login failed. Please check your credentials.';
         this.loading = false;
       }
     });
  }

  // ─── MSAL login ───────────────────────────────────────────────────────────

  loginWithMicrosoft(): void {
    this.error = '';
    this.loading = true;
    this.msalService.loginPopup({ scopes: environment.msal.scopes })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          const azureToken = result?.accessToken || result?.idToken;
          if (azureToken) {
            this.exchangeAzureToken(azureToken);
          }
        },
        error: () => {
          this.error = 'Microsoft sign-in was cancelled or failed.';
          this.loading = false;
        }
      });
  }

  private exchangeAzureToken(azureToken: string): void {
    this.lmsAuth.loginWithAzureToken(azureToken)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.router.navigate(['/']),
        error: err => {
          this.error = err?.message || 'Could not authenticate with LMS portal.';
          this.loading = false;
        }
      });
  }

  toggleFieldTextType(): void {
    this.fieldTextType = !this.fieldTextType;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

