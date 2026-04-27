import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { TimepickerModule } from "ngx-bootstrap/timepicker";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { ModalModule } from "ngx-bootstrap/modal";
import { AlertModule } from "ngx-bootstrap/alert";

import { PagetitleComponent } from "./pagetitle/pagetitle.component";
import { LoaderComponent } from "./loader/loader.component";
import { BugReportComponent } from "./bug-report/bug-report.component";

@NgModule({
  declarations: [PagetitleComponent, LoaderComponent, BugReportComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    AlertModule.forRoot(),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [PagetitleComponent, LoaderComponent, BugReportComponent],
})
export class UIModule {}
