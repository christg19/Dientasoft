import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'general', loadChildren: () => import('./general/general.module').then(m => m.GeneralModule) },
  {path: 'appointment', loadChildren: () => import('./appointment/appointment.module').then(m => m.AppointmentModule)},
  {path: 'patients', loadChildren: () => import('./patients/patients.module').then(m => m.PatientsModule)},
  {path: 'services', loadChildren: () => import('./service/service.module').then(m => m.ServiceModule)},
  {path:'history', loadChildren: () => import('./history/history.module').then(m => m.HistoryModule)},
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
