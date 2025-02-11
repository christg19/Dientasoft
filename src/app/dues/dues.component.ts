import { ChangeDetectionStrategy, ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { Dues } from '../shared/interfaces/dues.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Service } from '../shared/interfaces/services.interface';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { DuesService } from '../shared/services/dues.service';
import { Router } from '@angular/router';
import { ServicesService } from '../shared/services/services.service';
import { Patient } from '../shared/interfaces/patient.interface';
import { ColumnDefinition } from '../base-grid-component/base-grid-component.component';
import { apiRoutes } from '../shared/const/backend-routes';
import { PatientService } from '../shared/services/patient.service';
import { RefreshService } from '../shared/services/refresh.service';


@Component({
  selector: 'app-dues',
  templateUrl: './dues.component.html',
  styleUrls: ['./dues.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DuesComponent {

  public columnDefs: ColumnDefinition[] = [
    { key: 'patientId', label: 'Paciente', dataType: 'string', function: 'patient' },
    { key: 'name', label: 'Servicio', dataType: 'string' },
    {key: 'totalCost', label: 'Dinero Restante', dataType: 'number'}

  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;

  public dialogRef!: MatDialogRef<any>;

  public serviceList: Service[] = [];
  public dueValue = 0;
  private dueQuantityValue = 0;
  public patientList!: Patient[];
  public loading: Boolean = false;
  public patientNames!: { [key: string]: string };
  public dueList: Dues[] = [];
  public duesRoute = apiRoutes.dues.main;
  public redirectToClient = '/patients';
  public redirectToServices = '/services';
  public serviceName!: string;
  public serviceId!: number;

  dueForm!: FormGroup;
  constructor(
    private duesService: DuesService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private router: Router,
    private servicesService: ServicesService,
    private patientsService: PatientService,
    private refreshService: RefreshService
  ) {

    this.dueForm = this.fb.group({
      patientId: ['', Validators.required],
      name: ['', Validators.required],
      serviceId: [this.serviceName, Validators.required],
      dueQuantity: [this.dueQuantityValue, Validators.required],
      totalCost: [this.dueValue, Validators.required]
    });
  }

  ngOnChanges(): void {
  }

  ngOnInit(): void {
    this.loading = true;
    this.getAllDues();

    setTimeout(() => {
      this.loading = false;
    }, 200)
  }

  ngAfterViewInit() {
    this.getAllPatients();
    this.getAllServices();
  }

  applyFilter(event: Event) {
    // const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    // const filterResult = this.serviceList.filter(propertie =>
    //   propertie.name.toLowerCase().includes(filterValue)
    // );
    // this.dataSource.data = filterResult;

    // if (this.dataSource.paginator) {
    //   this.dataSource.paginator.firstPage();
    // }
  }

  async calculatePendingCost(id: number) {
    this.servicesService.getServiceById(id).subscribe({
      next: (service: any) => {

        this.dueValue = service.cost;
        this.dueQuantityValue = service.duesQuantity;
        this.serviceId = id;
        this.serviceName = service.name;

        this.dueForm.patchValue({
          totalCost: this.dueValue,
          dueQuantity: this.dueQuantityValue,
          name: `Cuotas de ${this.serviceName} `
        });
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }

  getPatientName(id: string): string {
    return this.patientNames[id] || 'Desconocido';
  }

  getAllPatients() {
    this.patientsService.getPatients().subscribe({
      next: (patients: any) => {
        this.patientList = patients;
      },
      error: (error: any) => {
        console.log(error);
      }
    });

  }

  compareFn(a: any, b: any): boolean {
    return a === b;
  }

  deleteDue(id: number) {
    this.duesService.deleteDue(id).subscribe({
      next: (response: any) => {
        console.log('Servicio eliminado con exito:', response);
        this.getAllDues();

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
      },
      error: (error) => {
        console.error(error)
      }
    })
  }


  async getAllDues() {
    this.duesService.getDues().subscribe(async (dues: any) => {
      const duePromises = dues.map(async (due: any) => {
        const patientName = await this.getPatientNameById(due.patientId);
        const serviceName = await this.getServiceById(due.serviceId);
        return {
          ...due,
          patientId: patientName,
          serviceId: serviceName
        };
      });

      this.dueList = await Promise.all(duePromises);
      console.log(this.dueList)
    });
  }

  getPatientNameById(id: number): Promise<string> {
    return new Promise((resolve, reject) => {
      this.patientsService.getPatientById(id).subscribe({
        next: (patient: any) => {
          resolve(patient.name);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  getServiceById(id: number): Promise<string> {
    return new Promise((resolve, reject) => {
      this.servicesService.getServiceById(id).subscribe({
        next: (service: any) => {
          resolve(service.name);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  openModal(templateRef: TemplateRef<any>, id?: number): void {

      this.dueForm.reset();

    this.dialogRef = this.dialog.open(templateRef, { width: '600px', height: '650px' });

  }

  closeModal(): void {
    this.dialogRef.close();
  }

  redirect(url: string) {
    this.router.navigate([url])
    this.closeModal();
  }

  updateDue(due: Dues, id: number) {
    this.duesService.updateDue(due, id).subscribe({
      next: (response: any) => {
        console.log('Updateado con exito:', response);
        this.getAllDues();
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

  createDue(due: Dues) {
    this.duesService.createDue(due).subscribe({
      next: (response: any) => {
        console.log('Cuota creada exitosamente:', response);
        this.refreshService.triggerRefresh();
      },
      error: (error: any) => {
        console.error('Error al crear la cuota:', error);
      }
    });
  }

  submitForm() {
    if (this.dueForm.valid) {

      const formValue = this.dueForm.value;

      this.createDue(formValue);
      this.closeModal();

    } else {
      console.error('El formulario es inválido', this.dueForm.errors);
      Object.keys(this.dueForm.controls).forEach(key => {
        const controlErrors = this.dueForm.get(key)!.errors;
        if (controlErrors != null) {
          Object.keys(controlErrors).forEach(keyError => {
            console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
          });
        }
      });
    }
  }
}

