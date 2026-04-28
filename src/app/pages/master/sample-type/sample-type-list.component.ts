import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { environment } from '../../../../environments/environment';

interface SampleType {
  id: string;
  shortCode: string;
  description: string;
}

@Component({
  selector: 'app-sample-type-list',
  templateUrl: './sample-type-list.component.html'
})
export class SampleTypeListComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  term = '';
  submitted = false;
  editId: string | null = null;
  sampleTypeForm!: UntypedFormGroup;
  loading = false;
  error = '';

  @ViewChild('formModal', { static: false }) formModal?: ModalDirective;
  @ViewChild('deleteModal', { static: false }) deleteModal?: ModalDirective;

  deleteTargetId: string | null = null;
  dataList: SampleType[] = [];

  constructor(private http: HttpClient, private fb: UntypedFormBuilder) {}

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Master Data' }, { label: 'Sampling' }, { label: 'Sample Type', active: true }];
    this.initForm();
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';
    this.http.get<{ items: SampleType[] }>(`${environment.apiUrl}/api/v1/external-customer/sample-type/list`)
      .subscribe({
        next: res => { this.dataList = res.items; this.loading = false; },
        error: err => { this.error = err?.error?.error_message || 'Failed to load sample types.'; this.loading = false; }
      });
  }

  initForm(data?: SampleType): void {
    this.sampleTypeForm = this.fb.group({
      shortCode: [data?.shortCode || '', [Validators.required]],
      description: [data?.description || '', [Validators.required]]
    });
  }

  get form() { return this.sampleTypeForm.controls; }

  get filteredList(): SampleType[] {
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

  openEdit(item: SampleType): void {
    this.editId = item.id;
    this.submitted = false;
    this.initForm(item);
    this.formModal?.show();
  }

  save(): void {
    this.submitted = true;
    if (this.sampleTypeForm.invalid) return;

    const val = this.sampleTypeForm.value;
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
