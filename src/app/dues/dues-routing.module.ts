import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DuesComponent } from './dues.component';

const routes: Routes = [
  {
    path: '',
    component: DuesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DuesRoutingModule { }
