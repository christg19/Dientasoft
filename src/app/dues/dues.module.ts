import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'; 
import {MatButtonModule} from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { DuesRoutingModule } from './dues-routing.module';
import { DuesComponent } from './dues.component';
import {MatTableModule} from '@angular/material/table';
import {MatIconModule} from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import {MatPaginatorModule} from '@angular/material/paginator';
import { ReactiveFormsModule } from '@angular/forms';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { SharedGridModule } from '../shared/modules/grid-componente.shared.module';

@NgModule({
  declarations: [
    DuesComponent
  ],
  imports: [
    CommonModule,
    DuesRoutingModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatTableModule,
    MatSelectModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    SharedGridModule
  ]
})
export class DuesModule { }
