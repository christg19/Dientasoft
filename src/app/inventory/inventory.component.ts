import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Patient } from '../shared/interfaces/patient.interface';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent {
  public buttonsNames: string[] = ['Instrumentos', 'Quimicos', 'Desechables'];

  public tableOptions = [
    {
      buttonName: "Instrumentos",
      active: true,
      columns: ['Item','Cantidad disponible','Fecha de compra','Notas', 'Esterilizado / Limpiado / Empaquetado']
    },
    {
      buttonName: "Quimicos",
      active: false,
      columns: ['Item','Cantidad disponible', 'Fecha de caducidad','Notas']
    },
    {
      buttonName: "Desechables",
      active: false,
      columns: ['Item','Cantidad disponible','Fecha de caducidad','Notas']
    }
  ];

  inventoryList: Patient[] = [];
  displayedColumns: string[] = ['items', 'quantity', 'date', 'notes', 'actions'];

  dataSource = new MatTableDataSource<Patient>(this.inventoryList);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private paginators: MatPaginatorIntl, private changeDetectorRef: ChangeDetectorRef) {
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

  toggleActive(selectedOption: any) {
    this.tableOptions.forEach(option => option.active = false);
    selectedOption.active = true;
    this.changeDetectorRef.detectChanges();

  }
  
  getDisplayedColumns(): string[] {
    const activeOption = this.tableOptions.find(option => option.active);
    return activeOption ? activeOption.columns : [];
  }

  addItem(){

  }
}
