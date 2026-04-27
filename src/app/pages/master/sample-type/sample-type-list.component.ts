import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-sample-type-list',
  templateUrl: './sample-type-list.component.html'
})
export class SampleTypeListComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  term = '';
  submitted = false;
  editId: number | null = null;
  sampleTypeForm!: UntypedFormGroup;

  @ViewChild('formModal', { static: false }) formModal?: ModalDirective;
  @ViewChild('deleteModal', { static: false }) deleteModal?: ModalDirective;

  deleteTargetId: number | null = null;

  dataList = [
    { id: 1, code: 'BLD', name: 'Blood', description: 'Whole blood specimen' },
    { id: 2, code: 'SRM', name: 'Serum', description: 'Serum after centrifugation' },
    { id: 3, code: 'URN', name: 'Urine', description: 'Mid-stream urine collection' },
    { id: 4, code: 'CSF', name: 'Cerebrospinal Fluid', description: 'Collected via lumbar puncture' },
  ];

  constructor(private modalService: BsModalService, private fb: UntypedFormBuilder) {}

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Master Data' }, { label: 'Sampling' }, { label: 'Sample Type', active: true }];
    this.initForm();
  }

  initForm(data?: any): void {
    this.sampleTypeForm = this.fb.group({
      code: [data?.code || '', [Validators.required]],
      name: [data?.name || '', [Validators.required]],
      description: [data?.description || '']
    });
  }

  get form() { return this.sampleTypeForm.controls; }

  get filteredList() {
    if (!this.term) return this.dataList;
    const t = this.term.toLowerCase();
    return this.dataList.filter(d =>
      d.name.toLowerCase().includes(t) || d.code.toLowerCase().includes(t)
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
    if (this.sampleTypeForm.invalid) return;

    const val = this.sampleTypeForm.value;
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
