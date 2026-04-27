import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-unit-list',
  templateUrl: './unit-list.component.html'
})
export class UnitListComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  term = '';
  submitted = false;
  editId: number | null = null;
  unitForm!: UntypedFormGroup;

  @ViewChild('formModal', { static: false }) formModal?: ModalDirective;
  @ViewChild('deleteModal', { static: false }) deleteModal?: ModalDirective;

  deleteTargetId: number | null = null;

  dataList = [
    { id: 1, code: 'mg', name: 'Milligram', description: 'Unit of mass' },
    { id: 2, code: 'ml', name: 'Milliliter', description: 'Unit of volume' },
    { id: 3, code: 'g/dL', name: 'Gram per Deciliter', description: 'Concentration unit' },
    { id: 4, code: 'IU/L', name: 'International Units per Liter', description: 'Enzyme activity unit' },
  ];

  constructor(private modalService: BsModalService, private fb: UntypedFormBuilder) {}

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Master Data' }, { label: 'General' }, { label: 'Unit', active: true }];
    this.initForm();
  }

  initForm(data?: any): void {
    this.unitForm = this.fb.group({
      code: [data?.code || '', [Validators.required]],
      name: [data?.name || '', [Validators.required]],
      description: [data?.description || '']
    });
  }

  get form() { return this.unitForm.controls; }

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
    if (this.unitForm.invalid) return;

    const val = this.unitForm.value;
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
