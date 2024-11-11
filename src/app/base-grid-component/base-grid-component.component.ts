import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { BaseGridService } from '../shared/services/baseGrid.service';
import { RefreshService } from '../shared/services/refresh.service';
import { componentRoutes } from '../shared/const/component-routes';
import { Router } from '@angular/router';
import { Patient } from '../shared/interfaces/patient.interface';
import { apiRoutes } from '../shared/const/backend-routes';
import { Observable, catchError, filter, map, of, throwError } from 'rxjs';

export interface ColumnDefinition {
  key: string;
  label?: string;
  dataType?: 'string' | 'number' | 'boolean' | 'date' | 'array';
  editable?: boolean;
  icon?: string;
  function?: 'patient' | 'product' | 'service';
}

@Component({
  selector: 'app-base-grid-component',
  templateUrl: './base-grid-component.component.html',
  styleUrls: ['./base-grid-component.component.scss']
})
export class BaseGridComponentComponent<T extends { id: number }> implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private originalRowData: T | null = null;
  private functionCache = new Map<string, Observable<string | string[]>>();
  private routes = apiRoutes;

  public dataSource = new MatTableDataSource<T>();
  public displayedColumns: string[] = [];
  public displayedColumnsWithActions: string[] = [];
  public componentRoute!: string;
  public editingRowId: number | null = null;
  public keyName = 'icon';

  @Input() columnDefinitions: ColumnDefinition[] = [];

  @Input() set getData(route: string) {
    this.componentRoute = route;

    this.gridService.getData(route).subscribe(
      (response: any) => {
        console.log(response)
        this.dataSource.data = response;
        this.displayedColumns = this.columnDefinitions.map(col => col.key);
        this.displayedColumnsWithActions = [...this.displayedColumns, 'actions'];
      },
      (error) => {
        console.warn('Se produjo un error al traer la data: ', error);
      }
    );
  }

  constructor(
    private paginators: MatPaginatorIntl,
    private gridService: BaseGridService,
    private refreshService: RefreshService,
    private router: Router
  ) {

    this.paginators.itemsPerPageLabel = "Registros por página";
    this.paginators.nextPageLabel = "Siguiente página";
    this.paginators.previousPageLabel = "Página anterior";
    this.paginators.lastPageLabel = "Última página";
    this.paginators.firstPageLabel = "Primera página";

    this.paginators.getRangeLabel = (page, pageSize, length) => {
      return this.spanishRangeLabel(page, pageSize, length);
    };

    this.refreshService.refresh$.subscribe(() => {
      this.loadData();
    });
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  spanishRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex =
      startIndex < length
        ? Math.min(startIndex + pageSize, length)
        : startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} de ${length}`;
  }

  loadData(): void {
    this.gridService.getData(this.componentRoute).subscribe(
      (response: any) => {
        this.dataSource.data = response;
        this.displayedColumns = this.columnDefinitions.map(col => col.key);
        this.displayedColumnsWithActions = [...this.displayedColumns, 'actions'];
      },
      (error) => {
        console.warn('Se produjo un error al traer la data: ', error);
      }
    );
  }


  enableEdit(rowId: number): void {
    this.editingRowId = rowId;

    const row = this.dataSource.data.find(item => item.id === rowId);
    if (row) {
      this.originalRowData = { ...row };
    }
  }

  cancelEdit(): void {
    const rowIndex = this.dataSource.data.findIndex(
      item => item.id === this.editingRowId
    );
    if (rowIndex !== -1 && this.originalRowData) {
      this.dataSource.data[rowIndex] = { ...this.originalRowData };
    }
    this.editingRowId = null;
    this.originalRowData = null;
  }

  getInputType(column: ColumnDefinition): string {
    switch (column.dataType) {
      case 'number':
        return 'number';
      case 'date':
        return 'date';
      case 'boolean':
        return 'checkbox';
      case 'array':
        return 'text';
      default:
        return 'text';
    }
  }

  getFunction(column: ColumnDefinition, ids: number | number[]): Observable<string | string[]> {
    const cacheKey = `${column.key}-${ids}`;
    
    // Si ya está en caché, devuélvelo
    if (this.functionCache.has(cacheKey)) {
      return this.functionCache.get(cacheKey)!;
    }
  
    let result$: Observable<string | string[]>;
  
    switch (column.function) {
      case 'patient':
        result$ = this.getPatientsNames(ids);
        break;
      default:
        console.warn(`Función desconocida: ${column.function}`);
        result$ = of('Función no definida');
    }
  
    // Guardar el resultado en caché
    this.functionCache.set(cacheKey, result$);
    return result$;
  }
  
  getPatientsNames(ids: number | number[]): Observable<string | string[]> {
    const baseUrl = this.routes.patient.main;
  
    return this.gridService.getData<Patient[]>(baseUrl).pipe(
      map((patients: Patient[]) => {
        console.log('Pacientes disponibles:', patients);
        console.log('Buscando ID:', ids);
  
        if (typeof ids === 'number') {
          // Convertimos el ID en caso de discrepancia de tipos
          const patient = patients.find((p) => p.id === Number(ids));
          return patient ? patient.name : 'Paciente no encontrado';
        }
  
        if (Array.isArray(ids)) {
          return patients
            .filter((p) => ids.includes(Number(p.id))) // Aseguramos que IDs sean del mismo tipo
            .map((p) => p.name);
        }
  
        return 'Datos inválidos';
      }),
      catchError((error) => {
        console.warn('Error al conseguir los nombres de los pacientes:', error);
        return throwError(() => error);
      })
    );
  }
  
  

  getProductsNames(ids: number | number[]) {

  }

  getServicesNames(ids: number | number[]) {

  }

  redirect(url: string) {
    this.router.navigate([url])
  }

  getRouteToRedirect(icon: string, id: number): void {
    const index = componentRoutes.findIndex((item) => {
      return item.semantic.includes(icon);
    });

    if (index !== -1) {
      this.redirect(`${componentRoutes[index].route}/${id}`);
    } else {
      console.warn(`No se encontró ninguna ruta para el ícono: ${icon}`);
    }
  }


  formatValue(value: any, dataType?: string): string {
    if (dataType === 'array' && Array.isArray(value)) {
      return value.join(', ');
    }
    return value !== undefined && value !== null ? value.toString() : 'N/A';
  }

  saveRow(row: T): void {
    if (!this.originalRowData) {
      console.warn('No hay datos originales para comparar.');
      return;
    }

    const payload: Partial<T> = {};

    for (const key of Object.keys(row) as Array<keyof T>) {
      const columnDef = this.columnDefinitions.find(col => col.key === key);

      if (columnDef?.editable === false) {
        continue;
      }

      if (row[key] !== this.originalRowData[key]) {
        let newValue: any = row[key];

        if (columnDef?.dataType === 'number') {
          newValue = Number(newValue);
        } else if (columnDef?.dataType === 'boolean') {
          newValue = newValue === 'true' || newValue === true;
        } else if (columnDef?.dataType === 'date') {
          newValue = new Date(newValue as any);
        } else if (columnDef?.dataType === 'array') {
          newValue = typeof newValue === 'string' ? newValue.split(',').map(item => item.trim()) : newValue;
        }

        payload[key] = newValue;
      }
    }

    if (Object.keys(payload).length === 0) {
      console.log('No hay cambios para guardar.');
      this.editingRowId = null;
      this.originalRowData = null;
      return;
    }

    this.gridService.updateData(this.componentRoute, payload, row.id).subscribe(
      (response) => {
        console.log('Datos actualizados:', response);
        this.editingRowId = null;
        this.originalRowData = null;
      },
      (error) => {
        console.warn('Error al actualizar:', error);
      }
    );
  }

  deleteRow(row: T): void {
    this.gridService.deleteData(this.componentRoute, row.id).subscribe(
      (response) => {
        console.log('Datos eliminados: ', response);
        this.refreshService.triggerRefresh();
      },
      (error) => {
        console.warn('Error al borrar: ', error);
      }
    )

  }


}



// applyFilter(event: Event) {
//   const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
//   const filterResult = this.serviceList.filter(propertie =>
//     propertie.name.toLowerCase().includes(filterValue)
//   );
//   this.dataSource.data = filterResult;

//   if (this.dataSource.paginator) {
//     this.dataSource.paginator.firstPage();
//   }
// }