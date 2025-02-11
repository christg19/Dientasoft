import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./general/general.module').then(m => m.GeneralModule),
    data: { animation: 'GeneralPage' }, 
  },
  {
    path: 'appointment',
    loadChildren: () => import('./appointment/appointment.module').then(m => m.AppointmentModule),
    data: { animation: 'AppointmentPage' },
  },
  {
    path: 'patients',
    loadChildren: () => import('./patients/patients.module').then(m => m.PatientsModule),
    data: { animation: 'PatientsPage' },
  },
  {
    path: 'services',
    loadChildren: () => import('./service/service.module').then(m => m.ServiceModule),
    data: { animation: 'ServicesPage' },
  },
  {
    path: 'history',
    loadChildren: () => import('./history/history.module').then(m => m.HistoryModule),
    data: { animation: 'HistoryPage' }, 
  },
  {
    path: 'inventory',
    loadChildren: () => import('./inventory/inventory.module').then(m => m.InventoryModule),
    data: { animation: 'InventoryPage' }, 
  },
  {
    path: 'dues',
    loadChildren: () => import('./dues/dues.module').then(m => m.DuesModule),
    data: { animation: 'DuesPage' }, 
  },
  { path: '**', redirectTo: '', data: { animation: 'GeneralPage' } },
];


@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })], 
  exports: [RouterModule]
})
export class AppRoutingModule { }
