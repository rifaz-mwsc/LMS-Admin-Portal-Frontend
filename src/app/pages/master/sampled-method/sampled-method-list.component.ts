import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { environment } from '../../../../environments/environment';

interface SampledMethod {
  id: string;
  shortCode: string;
  description: string;
}

@Component({
  selector: 'app-sampled-method-list',
  templateUrl: './sampled-method-list.component.html'
})
export class SampledMethodListComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  term = '';
  submitted = false;
  editId: string | null = null;
  sampledMethodForm!: UntypedFormGroup;
  loading = false;
  error = '';

  @ViewChild('formModal', { static: false }) formModal?: ModalDirective;
  @ViewChild('deleteModal', { static: false }) deleteModal?: ModalDirective;

  deleteTargetId: string | null = null;
  dataList: SampledMethod[] = [];

  constructor(private http: HttpClient, private fb: UntypedFormBuilder) {}

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Master Data' }, { label: 'Sampling' }, { label: 'Sampled Method', active: true }];
    this.initForm();
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';
    this.http.get<{ items: SampledMethod[] }>(`${environment.apiUrl}/api/v1/external-customer/sample-method/list`)
      .subscribe({
        next: res => { this.dataList = res.items; this.loading = false; },
        error: err => { this.error = err?.error?.error_message || 'Failed to load sampled methods.'; this.loading = false; }
      });
  }

  initForm(data?: SampledMethod): void {
    this.sampledMethodForm = this.fb.group({
      shortCode: [data?.shortCode || '', [Validators.required]],
      description: [data?.description || '', [Validators.required]]
    });
  }

  get form() { return this.sampledMethodForm.controls; }

  get filteredList(): SampledMethod[] {
    if (!this.term) return this.dataList;
    const t = this.term.toLowerCase();
    return this.dataList.filter(d =>
      d.shortCode.toLowerCase().includes(t) || d.description.toLowerCase().includes(t)
    );
  }

  openAdd(): void {
    this.editId = null;
    this.submitted = false;
    this.initForm();
    this.formModal?.show();
  }

  openEdit(item: SampledMethod): void {
    this.editId = item.id;
    this.submitted = false;
    this.initForm(item);
    this.formModal?.show();
  }

  save(): void {
    this.submitted = true;
    if (this.sampledMethodForm.invalid) return;

    const val = this.sampledMethodForm.value;
    if (this.editId) {
      const idx = this.dataList.findIndex(d => d.id === this.editId);
      if (idx > -1) this.dataList[idx] = { ...this.dataList[idx], ...val };
    } else {
      this.dataList = [...this.dataList, { id: crypto.randomUUID(), ...val }];
    }
    this.formModal?.hide();
  }

  confirmDelete(id: string): void {
    this.deleteTargetId = id;
    this.deleteModal?.show();
  }

  delete(): void {
    this.dataList = this.dataList.filter(d => d.id !== this.deleteTargetId);
    this.deleteModal?.hide();
  }
}
