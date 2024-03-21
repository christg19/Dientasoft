import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { DataSource } from '@angular/cdk/collections';
import { PatientsService } from '../shared/services/patient.service';
import { Patient } from '../shared/interfaces/patient.interface';
import { ServicesService } from '../shared/services/services.service';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.scss']
})
export class ServiceComponent {
  displayedColumns: string[] = ['name', 'cost', 'actions'];
  serviceList: Patient[] = [];
  loading: Boolean = false;
  dataSource = new MatTableDataSource<any>(this.serviceList);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private router: Router, private paginators: MatPaginatorIntl, private servicesService: ServicesService,
    private route: ActivatedRoute, private cdr: ChangeDetectorRef) {

    this.paginators.itemsPerPageLabel = "Registros por página";
    this.paginators.nextPageLabel = "Siguiente página";
    this.paginators.previousPageLabel = "Página anterior";
    this.paginators.lastPageLabel = "Ultima página";
    this.paginators.firstPageLabel = "Primera página";

    this.paginators.getRangeLabel = (page, pageSize, length) => {
      return this.spanishRangeLabel(page, pageSize, length);
    };
  }

  ngOnInit(): void {
    this.loading = true;
    this.getAllServices();
    this.loading = false;
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    const filterResult = this.serviceList.filter(propertie =>
      propertie.name.toLowerCase().includes(filterValue)
    );
    this.dataSource.data = filterResult;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteService(id: string) {
    this.servicesService.deleteService(id).subscribe({
      next: (response: any) => {
        console.log('Servicio eliminado con exito:', response);
        this.getAllServices();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  getAllServices() {
    this.servicesService.getServices().subscribe({
      next: (services: any) => {
        this.serviceList = services;
        this.dataSource.data = this.serviceList;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error)
      }
    })
  }

  redirect(url: string) {
    this.router.navigate([url])
  }

  redirectToEdit(id: string): void {
    this.router.navigate(['/patients/updateService', id]);
  }

}


