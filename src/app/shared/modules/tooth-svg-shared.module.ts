import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToothSVGModule } from '../components/tooth-svg/tooth-svg.module';
import { ToothSVGComponent } from '../components/tooth-svg/tooth-svg.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatIconModule} from '@angular/material/icon';

@NgModule({
  declarations: [
    ToothSVGComponent,
  ],
  imports: [
    CommonModule,
    MatButtonToggleModule,
    MatIconModule
  ],
  exports: [
    ToothSVGComponent  
  ]
})
export class SharedModule {}
