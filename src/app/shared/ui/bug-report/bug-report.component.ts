import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AsanaService } from '../../../core/services/asana.service';

@Component({
  selector: 'app-bug-report',
  templateUrl: './bug-report.component.html'
})
export class BugReportComponent implements OnInit {

  @ViewChild('bugModal') bugModal!: ModalDirective;

  bugForm!: UntypedFormGroup;
  submitted = false;
  loading = false;
  success = false;
  error = '';

  priorities = ['Low', 'Medium', 'High'];

  constructor(
    private fb: UntypedFormBuilder,
    private asana: AsanaService
  ) {}

  ngOnInit(): void {
    this.bugForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      priority: ['Medium', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      stepsToReproduce: ['']
    });
  }

  get f() { return this.bugForm.controls; }

  open(): void {
    this.submitted = false;
    this.success = false;
    this.error = '';
    this.loading = false;
    this.bugForm.reset({ priority: 'Medium' });
    this.bugModal.show();
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    if (this.bugForm.invalid) return;

    this.loading = true;
    this.asana.createBugTask({
      title: this.f['title'].value,
      priority: this.f['priority'].value,
      description: this.f['description'].value,
      stepsToReproduce: this.f['stepsToReproduce'].value,
      pageUrl: window.location.href
    }).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        setTimeout(() => this.bugModal.hide(), 2000);
      },
      error: err => {
        this.loading = false;
        this.error = err?.error?.errors?.[0]?.message || 'Failed to create bug report. Please try again.';
      }
    });
  }
}
