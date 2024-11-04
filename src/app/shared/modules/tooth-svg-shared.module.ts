import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToothSVGModule } from '../components/tooth-svg/tooth-svg.module';
import { ToothSVGComponent } from '../components/tooth-svg/tooth-svg.component';

@NgModule({
  declarations: [
    ToothSVGComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ToothSVGComponent  
  ]
})
export class SharedModule {}
