import { Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Patient } from '../shared/interfaces/patient.interface';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent {
  public buttonsNames:string[] = ['Instrumentos', 'Quimicos', 'Desechables'];

  inventoryList:Patient[] = [];
  displayedColumns: string[] = ['date', 'patientName', 'procedure', 'amount'];

  dataSource = new MatTableDataSource<Patient>(this.inventoryList);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

constructor(private paginators: MatPaginatorIntl){
  this.paginators.itemsPerPageLabel = "Registros por página";
  this.paginators.nextPageLabel = "Siguiente página";
  this.paginators.previousPageLabel = "Página anterior";
  this.paginators.lastPageLabel = "Ultima página";
  this.paginators.firstPageLabel = "Primera página";

  this.paginators.getRangeLabel = (page, pageSize, length) => {
    return this.spanishRangeLabel(page, pageSize, length);
  };
}

ngAfterViewInit() {
  this.dataSource.paginator = this.paginator;
}

spanishRangeLabel(page: number, pageSize: number, length: number): string {
  if (length == 0 || pageSize == 0) {
    return `0 de ${length}`;
  }
  length = Math.max(length, 0);
  const startIndex = page * pageSize;
  const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
  return `${startIndex + 1} - ${endIndex} de ${length}`;
}

}
