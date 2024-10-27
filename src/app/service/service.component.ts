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
import { Product } from '../shared/interfaces/product.interface';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.scss']
})
export class ServiceComponent {
  displayedColumns: string[] = ['name', 'cost','materials','duesQuantity', 'actions'];
  private serviceId!: number;
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
        this.getAllServices();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

 async getAllServices() {
    this.servicesService.getServices().subscribe(async (service:any) => {
      const servicePromises = service.map(async (service:any) => {
        const materialNames = await this.getMaterialsByIds(service.productIds);
        return {
          ...service,
          productIds: materialNames.join(', ')
        }
      });
      this.serviceList = await Promise.all(servicePromises);
      this.dataSource.data = this.serviceList;
    })
  }

  getMaterialsByIds(ids: string[]): Promise<string[]> {

    const names = this.instrumentList
      .filter(product => ids.includes(product.id.toString()))
      .map(product => product.name);
    
    return Promise.resolve(names);
  }
  
  

  getProducts() {
    this.productService.getProducts().subscribe({
      next: (products: any) => {
        this.instrumentList = products;
        console.log('Instrument list loaded:', this.instrumentList);
        this.getAllServices(); 
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  gettingId(id: number): void {
    this.serviceId = id;
  }

  gettingIdAndOpenModal(id: number): void {
    console.log(id, 'gettingIdAndOpenModal');
    console.log('Current instrument list:', this.instrumentList); 
    this.updating = true;
    this.serviceId = id;
    this.openModal(this.modalContent, id);
  }

  loadServicesDetails(id: number) {
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
        console.log(service)
        
      },
      error => console.error(error)
    );
  }


  openModal(templateRef: TemplateRef<any>, id?: number): void {

    if (!id) {
      this.updating = false;
      this.serviceId = 0;
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

  compareFn(a: any, b: any): boolean {
    return a === b;
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

  updateService(service: Service, id: number) {
    this.servicesService.updateService(service, id).subscribe({
      next: (response: any) => {
        this.getAllServices();
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
        this.getAllServices();
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
        this.closeModal();
      } else {
        this.createService(formValue);
        this.closeModal();
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


