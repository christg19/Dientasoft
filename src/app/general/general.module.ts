import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; 
import { GeneralRoutingModule } from './general-routing.module';
import { GeneralComponent } from './general.component';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';


@NgModule({
  declarations: [
    GeneralComponent
  ],
  imports: [
    CommonModule,
    GeneralRoutingModule,
    HttpClientModule,
    MatTableModule,
    MatPaginatorModule,

  ]
})
export class GeneralModule { }
