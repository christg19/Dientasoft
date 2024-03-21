import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServiceComponent } from './service.component';
import { CreateServiceComponent } from './create-service/create-service.component';

const routes: Routes = [
  {
    path: '',
    component: ServiceComponent
  },
  {
    path: 'createService',
    component:CreateServiceComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServiceRoutingModule { }
