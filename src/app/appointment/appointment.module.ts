import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'; 
import { MatNativeDateModule } from '@angular/material/core'; 
import { ReactiveFormsModule } from '@angular/forms';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import {MatIconModule} from '@angular/material/icon';
import { AppointmentRoutingModule } from './appointment-routing.module';
import { AppointmentComponent } from './appointment.component';
import { MatSelectModule } from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import { FormsModule } from '@angular/forms';
import { CreateAppointmentComponent } from './create-appointment/create-appointment.component';
import { ToothSVGComponent } from '../shared/components/tooth-svg/tooth-svg.component';
import { SharedModule } from '../shared/modules/tooth-svg-shared.module';



@NgModule({
  declarations: [AppointmentComponent, CreateAppointmentComponent],
  imports: [
    CommonModule,
    AppointmentRoutingModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule, 
    MatNativeDateModule,
    ReactiveFormsModule,
    NgxMaterialTimepickerModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    FormsModule,
    MatProgressSpinnerModule,
    SharedModule
  ],
})
export class AppointmentModule {}
