import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { UIModule } from '../../shared/ui/ui.module';

import { MasterRoutingModule } from './master-routing.module';

import { UnitListComponent } from './unit/unit-list.component';
import { ContainerTypeListComponent } from './container-type/container-type-list.component';
import { InstrumentListComponent } from './instrument/instrument-list.component';
import { DecConfigurationListComponent } from './dec-configuration/dec-configuration-list.component';
import { SampleTypeListComponent } from './sample-type/sample-type-list.component';
import { SampledMethodListComponent } from './sampled-method/sampled-method-list.component';

@NgModule({
  declarations: [
    UnitListComponent,
    ContainerTypeListComponent,
    InstrumentListComponent,
    DecConfigurationListComponent,
    SampleTypeListComponent,
    SampledMethodListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    BsDropdownModule.forRoot(),
    UIModule,
    MasterRoutingModule
  ]
})
export class MasterModule { }
