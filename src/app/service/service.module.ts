import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'; 
import {MatButtonModule} from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { ServiceRoutingModule } from './service-routing.module';
import {MatTableModule} from '@angular/material/table';
import {MatIconModule} from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import {MatPaginatorModule} from '@angular/material/paginator';
import { ServiceComponent } from './service.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CreateServiceComponent } from './create-service/create-service.component'; 
import { LoadingModule } from '../shared/components/loading/loading.module';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { SharedGridModule } from '../shared/modules/grid-componente.shared.module';


@NgModule({
  declarations: [
    ServiceComponent,
    CreateServiceComponent
  ],
  imports: [
    CommonModule,
    ServiceRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    SharedGridModule
  ]
})
export class ServiceModule { }
