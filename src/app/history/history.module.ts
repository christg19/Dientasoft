import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import { HistoryRoutingModule } from './history-routing.module';
import { HistoryComponent } from './history.component';
import {MatButtonModule} from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'; 
import { ToothSVGModule } from '../shared/components/tooth-svg/tooth-svg.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { ToothSVGComponent } from '../shared/components/tooth-svg/tooth-svg.component';
import { SharedModule } from '../shared/modules/tooth-svg-shared.module';



@NgModule({
  declarations: [
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
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    SharedModule
  ]
})
export class HistoryModule { }
