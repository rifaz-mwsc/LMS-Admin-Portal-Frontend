import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-dec-configuration-list',
  templateUrl: './dec-configuration-list.component.html'
})
export class DecConfigurationListComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  term = '';
  submitted = false;
  editId: number | null = null;
  decForm!: UntypedFormGroup;

  @ViewChild('formModal', { static: false }) formModal?: ModalDirective;
  @ViewChild('deleteModal', { static: false }) deleteModal?: ModalDirective;

  deleteTargetId: number | null = null;

  dataList = [
    { id: 1, key: 'REPORT_HEADER', value: 'Central Laboratory', description: 'Report header title' },
    { id: 2, key: 'DECIMAL_PLACES', value: '2', description: 'Default decimal precision' },
    { id: 3, key: 'AUTO_VERIFY', value: 'false', description: 'Enable auto result verification' },
    { id: 4, key: 'CRITICAL_ALERT_EMAIL', value: 'lab@hospital.com', description: 'Alert recipient email' },
  ];

  constructor(private modalService: BsModalService, private fb: UntypedFormBuilder) {}

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Master Data' }, { label: 'Laboratory' }, { label: 'DEC Configuration', active: true }];
    this.initForm();
  }

  initForm(data?: any): void {
    this.decForm = this.fb.group({
      key: [data?.key || '', [Validators.required]],
      value: [data?.value || '', [Validators.required]],
      description: [data?.description || '']
    });
  }

  get form() { return this.decForm.controls; }

  get filteredList() {
    if (!this.term) return this.dataList;
    const t = this.term.toLowerCase();
    return this.dataList.filter(d =>
      d.key.toLowerCase().includes(t) || d.value.toLowerCase().includes(t)
    );
  }

  openAdd(): void {
    this.editId = null;
    this.submitted = false;
    this.initForm();
    this.formModal?.show();
  }

  openEdit(item: any): void {
    this.editId = item.id;
    this.submitted = false;
    this.initForm(item);
    this.formModal?.show();
  }

  save(): void {
    this.submitted = true;
    if (this.decForm.invalid) return;

    const val = this.decForm.value;
    if (this.editId) {
      const idx = this.dataList.findIndex(d => d.id === this.editId);
      if (idx > -1) this.dataList[idx] = { ...this.dataList[idx], ...val };
    } else {
      const newId = this.dataList.length ? Math.max(...this.dataList.map(d => d.id)) + 1 : 1;
      this.dataList = [...this.dataList, { id: newId, ...val }];
    }
    this.formModal?.hide();
  }

  confirmDelete(id: number): void {
    this.deleteTargetId = id;
    this.deleteModal?.show();
  }

  delete(): void {
    this.dataList = this.dataList.filter(d => d.id !== this.deleteTargetId);
    this.deleteModal?.hide();
  }
}
