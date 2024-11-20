import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatIconModule} from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InventoryComponent } from './inventory/inventory.component';
import { ModalContent1Component } from './shared/components/modal-content1/modal-content1.component';
import { LoadingComponent } from './shared/components/loading/loading.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { LoadingComponentComponent } from './loading-component/loading-component.component';
import { StatCardComponent } from './stat-card/stat-card.component';
import { BaseGridComponentComponent } from './base-grid-component/base-grid-component.component';
import { BaseGridComponentModule } from './base-grid-component/base-grid-component.module';
import { NgChartsModule } from 'ng2-charts';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';




@NgModule({
  declarations: [
    AppComponent,
    ModalContent1Component,
    LoadingComponent,
    LoadingComponent,
    LoadingComponentComponent,


  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatIconModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    NgChartsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
