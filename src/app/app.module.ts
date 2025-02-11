import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatIconModule} from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ModalContent1Component } from './shared/components/modal-content1/modal-content1.component';
import { LoadingComponent } from './shared/components/loading/loading.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { LoadingComponentComponent } from './loading-component/loading-component.component';
import { NgChartsModule } from 'ng2-charts';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { NotificationDialogComponent } from './notification-dialog/notification-dialog.component';
import {MatMenuModule} from '@angular/material/menu';




@NgModule({
  declarations: [
    AppComponent,
    ModalContent1Component,
    LoadingComponent,
    LoadingComponent,
    LoadingComponentComponent,
    NotificationDialogComponent,
    NotificationDialogComponent

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
    MatMenuModule
  ],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
  bootstrap: [AppComponent]
})
export class AppModule { }
