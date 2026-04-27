import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-instrument-list',
  templateUrl: './instrument-list.component.html'
})
export class InstrumentListComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  term = '';
  submitted = false;
  editId: number | null = null;
  instrumentForm!: UntypedFormGroup;

  @ViewChild('formModal', { static: false }) formModal?: ModalDirective;
  @ViewChild('deleteModal', { static: false }) deleteModal?: ModalDirective;

  deleteTargetId: number | null = null;

  statusOptions = ['Active', 'Inactive', 'Under Maintenance'];

  dataList = [
    { id: 1, name: 'Hematology Analyzer', model: 'XN-1000', serialNumber: 'SN-001', status: 'Active' },
    { id: 2, name: 'Chemistry Analyzer', model: 'AU480', serialNumber: 'SN-002', status: 'Active' },
    { id: 3, name: 'Coagulation Analyzer', model: 'STA-R Max', serialNumber: 'SN-003', status: 'Under Maintenance' },
    { id: 4, name: 'Urine Analyzer', model: 'IRIS iQ200', serialNumber: 'SN-004', status: 'Inactive' },
  ];

  constructor(private modalService: BsModalService, private fb: UntypedFormBuilder) {}

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Master Data' }, { label: 'Laboratory' }, { label: 'Instrument', active: true }];
    this.initForm();
  }

  initForm(data?: any): void {
    this.instrumentForm = this.fb.group({
      name: [data?.name || '', [Validators.required]],
      model: [data?.model || '', [Validators.required]],
      serialNumber: [data?.serialNumber || ''],
      status: [data?.status || 'Active', [Validators.required]]
    });
  }

  get form() { return this.instrumentForm.controls; }

  get filteredList() {
    if (!this.term) return this.dataList;
    const t = this.term.toLowerCase();
    return this.dataList.filter(d =>
      d.name.toLowerCase().includes(t) || d.model.toLowerCase().includes(t)
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
    if (this.instrumentForm.invalid) return;

    const val = this.instrumentForm.value;
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

  statusClass(status: string): string {
    return status === 'Active' ? 'badge-soft-success'
      : status === 'Inactive' ? 'badge-soft-danger'
      : 'badge-soft-warning';
  }
}
