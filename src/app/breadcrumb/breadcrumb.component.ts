import { Component, Input } from '@angular/core';

interface Breadcrumb {
  label: string;
  link?: string;
}

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent {
  @Input() title: string = '';
  @Input() breadcrumbs: Breadcrumb[] = [];
}
