import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss'],
})
export class StatCardComponent implements OnInit {
  @Input() stat: {
    title: string;
    value: Promise<number> | Promise<string> | number | string;
    color: string;
    icon: string;
  } = {
      title: '',
      value: Promise.resolve(0),
      color: '',
      icon: '',
    };

  resolvedValue: string | number = '';

  ngOnInit() {

    if (this.stat.value instanceof Promise) {
      this.stat.value.then((resolved) => {
        this.resolvedValue = resolved;
      });
    } else {

      this.resolvedValue = this.stat.value;
    }
  }
}
