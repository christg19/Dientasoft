import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppointmentComponent } from './appointment.component';
import { CreateAppointmentComponent } from './create-appointment/create-appointment.component';

const routes: Routes = [
  {
    path: '',
    component: AppointmentComponent
  },
  {
    path: 'createAppointment',
    component: CreateAppointmentComponent
  },
  {
    path: 'updateAppointment/:id',
    component: CreateAppointmentComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentRoutingModule { }
