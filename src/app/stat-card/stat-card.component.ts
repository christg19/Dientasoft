import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss']
})
export class StatCardComponent {
  @Input() stat: { title: string, value: string, color: string, icon:string } = {title: "", value: "", color: "", icon: ""};
}
