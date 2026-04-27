import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-sampled-method-list',
  templateUrl: './sampled-method-list.component.html'
})
export class SampledMethodListComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  term = '';
  submitted = false;
  editId: number | null = null;
  sampledMethodForm!: UntypedFormGroup;

  @ViewChild('formModal', { static: false }) formModal?: ModalDirective;
  @ViewChild('deleteModal', { static: false }) deleteModal?: ModalDirective;

  deleteTargetId: number | null = null;

  dataList = [
    { id: 1, code: 'VEN', name: 'Venipuncture', description: 'Blood draw from vein' },
    { id: 2, code: 'FIN', name: 'Finger Prick', description: 'Capillary blood from fingertip' },
    { id: 3, code: 'MID', name: 'Midstream Catch', description: 'Urine collection technique' },
    { id: 4, code: 'SWB', name: 'Swab', description: 'Surface swab collection' },
  ];

  constructor(private modalService: BsModalService, private fb: UntypedFormBuilder) {}

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Master Data' }, { label: 'Sampling' }, { label: 'Sampled Method', active: true }];
    this.initForm();
  }

  initForm(data?: any): void {
    this.sampledMethodForm = this.fb.group({
      code: [data?.code || '', [Validators.required]],
      name: [data?.name || '', [Validators.required]],
      description: [data?.description || '']
    });
  }

  get form() { return this.sampledMethodForm.controls; }

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
    if (this.sampledMethodForm.invalid) return;

    const val = this.sampledMethodForm.value;
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
