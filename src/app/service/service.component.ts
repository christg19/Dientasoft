import { AfterViewInit, ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { DataSource } from '@angular/cdk/collections';
import { PatientsService } from '../shared/services/patient.service';
import { Patient } from '../shared/interfaces/patient.interface';
import { ServicesService } from '../shared/services/services.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Service } from '../shared/interfaces/services.interface';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Instrument } from '../shared/interfaces/instrument.interface';
import { ProductService } from '../shared/services/product.service';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.scss']
})
export class ServiceComponent {
  displayedColumns: string[] = ['name', 'cost','materials','duesQuantity', 'actions'];
  private serviceId: string = '';
  serviceList: Patient[] = [];
  loading: Boolean = false;
  instrumentList:Instrument[] = [];
  updating: boolean = false;
  dialogRef!: MatDialogRef<any>;
  dataSource = new MatTableDataSource<any>(this.serviceList);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;
  serviceForm!: FormGroup;
  constructor(private productService:ProductService,public dialog: MatDialog, private fb: FormBuilder, private router: Router, private paginators: MatPaginatorIntl, private servicesService: ServicesService,
    private route: ActivatedRoute, private cdr: ChangeDetectorRef) {

    this.paginators.itemsPerPageLabel = "Registros por página";
    this.paginators.nextPageLabel = "Siguiente página";
    this.paginators.previousPageLabel = "Página anterior";
    this.paginators.lastPageLabel = "Ultima página";
    this.paginators.firstPageLabel = "Primera página";

    this.paginators.getRangeLabel = (page, pageSize, length) => {
      return this.spanishRangeLabel(page, pageSize, length);
    };

    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      cost: [, Validators.required],
      duesQuantity: [1, Validators.required],
      productIds: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.getAllServices();
    this.getProducts();
    setTimeout(()=>{
      this.loading = false;
    }, 200)
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
      },
      error: (error) => {
        console.error(error)
      }
    })
  }

  getProducts(){
    this.productService.getProducts().subscribe({
      next: (product:any) => {
        this.instrumentList = product;
      },
      error: (error) =>{
        console.log(error);
      }
    });
  }

  gettingId(id: string): void {
    this.serviceId = id;
  }

  gettingIdAndOpenModal(id: string): void {
    console.log(id, 'gettingIdAndOpenModal');
    this.updating = true;
    this.serviceId = id;
    this.openModal(this.modalContent, id);
  }

  loadServicesDetails(id: string) {
    this.updating = true;
    this.servicesService.getServiceById(id).subscribe(
      (service: any) => {
        const servicePatch: Service = service;
        this.serviceForm.patchValue({
          name: servicePatch.name,
          cost: servicePatch.cost,
          duesQuantity: servicePatch.duesQuantity,
          productIds: servicePatch.productIds
        });

        this.cdr.detectChanges();
      },
      error => console.error(error)
    );
  }


  openModal(templateRef: TemplateRef<any>, id?: string): void {

    if (!id) {
      this.updating = false;
      this.serviceId = '';
      this.serviceForm.reset();
      console.log('Creando nuevo servicio');
    } else {
      this.updating = true;
      this.serviceId = id;
      this.loadServicesDetails(id);
      console.log('Editando servicio existente');
    }

    this.dialogRef = this.dialog.open(templateRef, { width: '400px', height: '500px' });

    setTimeout(() => {
      this.cdr.detectChanges();

    }, 0);
  }



  closeModal(): void {
    this.dialogRef.close();
    this.updating = false;
  }

  redirect(url: string) {
    this.router.navigate([url])
  }

  redirectToEdit(id: string): void {
    this.router.navigate(['/services/editService', id]);
  }

  updateService(service: Service, id: string) {
    this.servicesService.updateService(service, id).subscribe({
      next: (response: any) => {
        console.log('Updateado con exito:', response);

      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  createService(service: Service) {
    this.servicesService.createService(service).subscribe({
      next: (response: any) => {
        console.log('Servicio creado exitosamente:', response);
        this.router.navigate(['/patients']);
      },
      error: (error: any) => {
        console.error('Error al crear el servicio:', error);
      }
    });
  }

  submitForm() {
    if (this.serviceForm.valid) {
      const formValue = this.serviceForm.value;

      if (this.serviceId) {
        this.updateService(formValue, this.serviceId)
        this.router.navigate(['/services']);
      } else {
        this.createService(formValue);
      }

    } else {
      console.error('El formulario es inválido', this.serviceForm.errors);
      Object.keys(this.serviceForm.controls).forEach(key => {
        const controlErrors = this.serviceForm.get(key)!.errors;
        if (controlErrors != null) {
            Object.keys(controlErrors).forEach(keyError => {
                console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
            });
        }
      });
    }
  }

}


