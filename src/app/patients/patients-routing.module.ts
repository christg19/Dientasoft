import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientsComponent } from './patients.component';
import { PatientComponent } from './patient/patient.component';
import { HistoryComponent } from '../history/history.component';

const routes: Routes = [
  {
    path: '',
    component: PatientsComponent
  },
  {
    path:'createPatient',
    component:PatientComponent
  },
  {
    path:'updatePatient/:id',
    component:PatientComponent
  },
  {
    path:'history/:id',
    component:HistoryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientsRoutingModule { }
