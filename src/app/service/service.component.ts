import { AfterViewInit, ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { ServicesService } from '../shared/services/services.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Service } from '../shared/interfaces/services.interface';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Instrument } from '../shared/interfaces/instrument.interface';
import { ProductService } from '../shared/services/product.service';
import { apiRoutes } from '../shared/const/backend-routes';
import { BaseGridComponentComponent, ColumnDefinition } from '../base-grid-component/base-grid-component.component';
import { RefreshService } from '../shared/services/refresh.service';


@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.scss']
})
export class ServiceComponent {
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;
  @ViewChild(BaseGridComponentComponent) baseGridComponent!: BaseGridComponentComponent<Service>;

  public serviceRoute = apiRoutes.services.main;
  public serviceList: Service[] = [];
  public loading: Boolean = false;
  public instrumentList:Instrument[] = [];
  public serviceForm!: FormGroup;
  public dialogRef!: MatDialogRef<any>;
  public columnDefs: ColumnDefinition[] = [
    //{ key: 'id', label: 'ID', dataType: 'number', editable: false },
    { key: 'name', label: 'Nombre', dataType: 'string' },
    { key: 'cost', label: 'Costo', dataType: 'number' },
    { key: 'duesQuantity', label: 'Cuotas', dataType: 'number' },
    //{ key: 'productIds', label: 'Productos', dataType: 'array' },
    //{ key: 'itemType', label: 'Tipo', dataType: 'string', editable: false },
  ];
  //Nombre, Costo, cuota

  constructor(private productService:ProductService,
    public dialog: MatDialog, 
    private fb: FormBuilder, 
    private router: Router, 
    private cdr: ChangeDetectorRef,
    private servicesService: ServicesService,
    private refreshService: RefreshService,
    ) {

    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      cost: [, Validators.required],
      duesQuantity: [1, Validators.required],
      productIds: [[], Validators.required]
    });


  }

  ngOnInit(): void {
    this.getProducts(); 
  }
  

  ngAfterViewInit() {
  }

  getMaterialsByIds(ids: string[]): Promise<string[]> {

    const names = this.instrumentList
      .filter(product => ids.includes(product.id.toString()))
      .map(product => product.name);
    
    return Promise.resolve(names);
  }

  getProducts() {
    this.productService.getProducts().subscribe(
      (response:any) => {
        this.instrumentList = response;
      }
    )
  }


  openModal(templateRef: TemplateRef<any>, id?: number): void {

    if (!id) {

      this.serviceForm.reset();
      console.log('Creando nuevo servicio');
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
  }

  redirect(url: string) {
    this.router.navigate([url])
  }

  redirectToEdit(id: string): void {
    this.router.navigate(['/services/editService', id]);
  }

  createService(service: Service) {
    this.servicesService.createService(service).subscribe({
      next: (response: any) => {
        console.log('Servicio creado exitosamente:', response);
        this.refreshService.triggerRefresh();
      },
      error: (error: any) => {
        console.error('Error al crear el servicio:', error);
      }
    });
  }

  submitForm() {
    if (this.serviceForm.valid) {
      const formValue = this.serviceForm.value;
   
        this.createService(formValue);
        this.closeModal();

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
  applyFilter($event:any){

  }
}


