import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; 
import { GeneralRoutingModule } from './general-routing.module';
import { GeneralComponent } from './general.component';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { StatCardComponent } from '../stat-card/stat-card.component';
import { NgChartsModule } from 'ng2-charts';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';


@NgModule({
  declarations: [
    GeneralComponent,
    StatCardComponent,
  ],
  imports: [
    CommonModule,
    GeneralRoutingModule,
    HttpClientModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    NgChartsModule,
    MatIconModule,
    MatButtonModule,
  ]
})
export class GeneralModule { }
