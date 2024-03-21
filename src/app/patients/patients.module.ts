import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'; // Asegúrate de importar MatInputModule
import { MatNativeDateModule } from '@angular/material/core'; // Importa MatNativeDateModule
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import {MatIconModule} from '@angular/material/icon';
import { PatientsRoutingModule } from './patients-routing.module';
import { PatientsComponent } from './patients.component';
import { MatSelectModule } from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { PatientComponent } from './patient/patient.component';
import { ReactiveFormsModule } from '@angular/forms'; 
import { LoadingComponent } from '../shared/components/loading/loading.component';


@NgModule({
  declarations: [
    PatientsComponent,
    PatientComponent,
    LoadingComponent
  ],
  imports: [
    CommonModule,
    PatientsRoutingModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    NgxMaterialTimepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatTableModule,
    MatPaginatorModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class PatientsModule { }
