import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UnitListComponent } from './unit/unit-list.component';
import { ContainerTypeListComponent } from './container-type/container-type-list.component';
import { InstrumentListComponent } from './instrument/instrument-list.component';
import { DecConfigurationListComponent } from './dec-configuration/dec-configuration-list.component';
import { SampleTypeListComponent } from './sample-type/sample-type-list.component';
import { SampledMethodListComponent } from './sampled-method/sampled-method-list.component';

const routes: Routes = [
  { path: 'unit', component: UnitListComponent },
  { path: 'container-type', component: ContainerTypeListComponent },
  { path: 'instrument', component: InstrumentListComponent },
  { path: 'dec-configuration', component: DecConfigurationListComponent },
  { path: 'sample-type', component: SampleTypeListComponent },
  { path: 'sampled-method', component: SampledMethodListComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterRoutingModule { }
