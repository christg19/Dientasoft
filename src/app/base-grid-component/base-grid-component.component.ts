import { AfterViewInit, ChangeDetectorRef, Component, Input, SimpleChanges, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { BaseGridService } from '../shared/services/baseGrid.service';
import { RefreshService } from '../shared/services/refresh.service';
import { componentRoutes } from '../shared/const/component-routes';
import { Router } from '@angular/router';
import { Patient } from '../shared/interfaces/patient.interface';
import { apiRoutes } from '../shared/const/backend-routes';
import { Observable, catchError, filter, map, of, throwError } from 'rxjs';
import { Product } from '../shared/interfaces/product.interface';
import { Service } from '../shared/interfaces/services.interface';
import { enumMap } from '../shared/const/enumFunctions';

export interface ColumnDefinition {
  key: string;
  label?: string;
  dataType?: 'string' | 'number' | 'boolean' | 'date' | 'array';
  editable?: boolean;
  icon?: string;
  function?: 'patient' | 'product' | 'service' | 'date';
  enum?: 'toothName' | 'statusName';
  date?: boolean
  selectEndpoint?: string;
}



@Component({
  selector: 'app-base-grid-component',
  templateUrl: './base-grid-component.component.html',
  styleUrls: ['./base-grid-component.component.scss']
})
export class BaseGridComponentComponent<T extends { [key: string]: any }> implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private originalRowData: T | null = null;
  private functionCache = new Map<string, Observable<string | string[]>>();
  private enumCache = new Map<string, Observable<string>>();
  private routes = apiRoutes;

  public selectOptions: { [key: string]: { id: number; name: string }[] } = {};

  public dataSource = new MatTableDataSource<T>();
  private originalData: T[] = []; 

  public displayedColumns: string[] = [];
  public displayedColumnsWithActions: string[] = [];
  public componentRoute!: string;
  public editingRowId: number | null = null;
  public keyName = 'icon';

  @Input() columnDefinitions: ColumnDefinition[] = [];
  @Input() filterStatus: number | null = null; 
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
    private router: Router,
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
      console.log('Recibiendo evento de refresco');
      this.loadData();
      this.applyFilter();
    });
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  ngOnInit(){
    this.loadSelectOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filterStatus'] && this.originalData.length > 0) {
      console.log('Cambio detectado en filterStatus:', this.filterStatus); 
      this.applyFilter();
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
  
  loadSelectOptions(): void {
    this.columnDefinitions.forEach((column) => {
      if (column.selectEndpoint) {
        this.gridService.getData<{ id: number; name: string }[]>(column.selectEndpoint).subscribe(
          (response) => {
            this.selectOptions[column.key] = response;
            console.log('Servicios para select: ',this.selectOptions)
          },
          (error) => {
            console.error(`Error cargando opciones para ${column.key}:`, error);
          }
        );
      }
    });
  }

  getEnumOptions(enumKey: string): { value: number; label: string }[] {
    if (enumKey === 'statusName') {
      return [
        { value: 0, label: 'Pendiente' },
        { value: 1, label: 'Completada' },
        { value: 2, label: 'Cancelada' },

      ];
    }
    return [];
  }  

  onSelectChange(column: ColumnDefinition, element: T): void {
    console.log(`Cambio en ${column.key}:`, element[column.key]);
  }

  loadData(): void {
    this.gridService.getData(this.componentRoute).subscribe(
      (response: any) => {
        this.originalData = response; 
        this.dataSource.data = response;
        this.applyFilter(); 
      },
      (error) => {
        console.warn('Error al cargar los datos:', error);
      }
    );
  }
  


  enableEdit(rowId: number): void {
    this.editingRowId = rowId;

    const row = this.dataSource.data.find(item => item['id'] === rowId);
    if (row) {
      this.originalRowData = { ...row };
    }
  }

  cancelEdit(): void {
    const rowIndex = this.dataSource.data.findIndex(
      item => item['id'] === this.editingRowId
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

    if (this.functionCache.has(cacheKey)) {
      return this.functionCache.get(cacheKey)!;
    }

    let result$: Observable<string | string[]>;

    switch (column.function) {
      case 'patient':
        result$ = this.getPatientsNames(ids);
        break;
      case 'service':
        result$ = this.getServicesNames(ids);
        break;
      case 'product':
        result$ = this.getProductsNames(ids);
        break;
      default:
        console.warn(`Función desconocida: ${column.function}`);
        result$ = of('Función no definida');
    }

    this.functionCache.set(cacheKey, result$);
    return result$;
  }

  handleArrayInput(column: ColumnDefinition, element: T): void {
    const key = column.key as keyof T; 

    if (column.dataType === 'array' && typeof element[key] === 'string') {

      const values = (element[key] as unknown as string)
        .split(',')
        .map(value => value.trim())
        .map(value => Number(value))
        .filter(value => !isNaN(value)); 

      element[key] = values as unknown as T[keyof T];
    }
  }

  formatDate(inputDate: string) {
    const date = new Date(inputDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    let hora = date.getHours();
    let minutes = String(date.getMinutes()).padStart(2, '0');
    const periodo = hora >= 12 ? 'PM' : 'AM';

    if (hora > 12) {
      hora -= 12;
    } else if (hora === 0) {
      hora = 12;
    }

    const horaFormateada = `${hora}:${minutes} ${periodo}`;
    const fechaFormateada = `${year}-${month}-${day} - ${horaFormateada}`;

    return fechaFormateada;
  }

  getEnum(enumType: string, enumNum: number): Observable<string> {
    const cacheKey = `enum-${enumType}-${enumNum}`;
  
    if (this.enumCache.has(cacheKey)) {
      return this.enumCache.get(cacheKey)!;
    }
  
    const translatedValue = this.translateEnum(enumType, enumNum);
    const translatedValue$ = of(translatedValue);
  
    this.enumCache.set(cacheKey, translatedValue$);
  
    return translatedValue$;
  }
  
  private translateEnum(enumType: string, enumNum: number): string {
    if (!enumType) {
      return 'Enum no especificado';
    }
  
    if (enumMap.has(enumType)) {
      return enumMap.get(enumType)?.(enumNum) || 'Valor no encontrado';
    } else {
      return 'Enum no encontrado';
    }
  }
  
  getPatientsNames(ids: number | number[]): Observable<string | string[]> {
    const baseUrl = this.routes.patient.main;

    return this.gridService.getData<Patient[]>(baseUrl).pipe(
      map((patients: Patient[]) => {
        if (typeof ids === 'number') {
          const patient = patients.find((p) => p.id === ids);
          return patient ? patient.name : 'Paciente no encontrado';
        }

        if (Array.isArray(ids)) {
          return patients
            .filter((p) => ids.includes(Number(p.id)))
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

  getProductsNames(ids: number | number[]): Observable<string | string[]> {
    const baseUrl = this.routes.product.main;

    return this.gridService.getData<Product[]>(baseUrl).pipe(
      map((products: Product[]) => {
        if (typeof ids === 'number') {
          const product = products.find((p) => p.id === ids);
          return product ? product.name : 'Paciente no encontrado';
        }

        if (Array.isArray(ids)) {
          return products
            .filter((p) => ids.includes(Number(p.id)))
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

  getServicesNames(ids: number | number[]): Observable<string | string[]> {
    const baseUrl = this.routes.services.main;

    return this.gridService.getData<Service[]>(baseUrl).pipe(
      map((services: Service[]) => {
        if (typeof ids === 'number') {
          const service = services.find((p) => p.id === ids);
          return service ? service.name : 'Paciente no encontrado';
        }

        if (Array.isArray(ids)) {
          return services
            .filter((p) => ids.includes(Number(p.id)))
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
  
    const payload: Partial<T> & { odontogramId?: number } = {};
  
    if ('odontogramId' in row) {
      payload['odontogramId'] = row['odontogramId'] as number;
    }
  
    for (const key of Object.keys(row) as Array<keyof T>) {
      const columnDef = this.columnDefinitions.find(col => col.key === key);
  
      if (columnDef?.editable === false) {
        continue;
      }
  
      if (row[key] !== this.originalRowData[key]) {
        let newValue: any = row[key];
  
        if (columnDef?.dataType === 'array') {
          if (typeof newValue === 'string') {
            newValue = newValue
              .split(',')
              .map(value => value.trim())
              .map(value => Number(value))
              .filter(value => !isNaN(value));
          } else if (Array.isArray(newValue)) {
            newValue = newValue.map(item => Number(item));
          }
        } else if (columnDef?.dataType === 'number') {
          newValue = Number(newValue);
        } else if (columnDef?.dataType === 'boolean') {
          newValue = newValue === 'true' || newValue === true;
        } else if (columnDef?.dataType === 'date') {
          newValue = new Date(newValue as any);
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
  
    this.gridService.updateData(this.componentRoute, payload, row['id']).subscribe(
      (response) => {
        console.log('Datos actualizados:', response);
        this.editingRowId = null;
        this.originalRowData = null;
        this.refreshService.triggerRefresh();
      },
      (error) => {
        console.warn('Error al actualizar:', error);
      }
    );
  }
  
  

  deleteRow(row: T): void {
    this.gridService.deleteData(this.componentRoute, row['id']).subscribe(
      (response) => {
        console.log('Datos eliminados: ', response);
        this.refreshService.triggerRefresh();
      },
      (error) => {
        console.warn('Error al borrar: ', error);
      }
    );
  }

  applyFilter(): void {
    console.log('Aplicando filtro en el hijo:', this.filterStatus);
    if (this.filterStatus === null) {
      this.dataSource.data = this.originalData; 
    } else {
      this.dataSource.data = this.originalData.filter(
        (item) => item['status'] === this.filterStatus
      );
    }
  
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }
  
  
  
}
