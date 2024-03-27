import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import { HistoryRoutingModule } from './history-routing.module';
import { HistoryComponent } from './history.component';
import { ToothSVGModule } from '../shared/components/tooth-svg/tooth-svg.module';
import {MatIconModule} from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { ToothSVGComponent } from '../shared/components/tooth-svg/tooth-svg.component';



@NgModule({
  declarations: [
    ToothSVGComponent,
    HistoryComponent,
  ],
  imports: [
    CommonModule,
    HistoryRoutingModule,
    ToothSVGModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule
  ]
})
export class HistoryModule { }
