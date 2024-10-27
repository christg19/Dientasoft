import { ChangeDetectionStrategy, ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { Dues } from '../shared/interfaces/dues.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Service } from '../shared/interfaces/services.interface';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { DuesService } from '../shared/services/dues.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicesService } from '../shared/services/services.service';
import { PatientsService } from '../shared/services/patient.service';
import { Patient } from '../shared/interfaces/patient.interface';


@Component({
  selector: 'app-dues',
  templateUrl: './dues.component.html',
  styleUrls: ['./dues.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DuesComponent {
  displayedColumns: string[] = ['patient', 'service', 'due', 'cost', 'actions'];
  private dueId!:number;
  serviceList: Service[] = [];
  dueValue = 0;
  dueQuantityValue = 0;
  patientList!: Patient[];
  loading: Boolean = false;
  dataTable: Dues[] = [];
  public patientNames!: { [key: string]: string };
  dueList: Dues[] = [];
  updating: boolean = false;
  dialogRef!: MatDialogRef<any>;
  redirectToClient = '/patients';
  redirectToServices = '/services';
  serviceName!:string;
  serviceId!:number;
  dataSource = new MatTableDataSource<any>(this.dueList);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;
  dueForm!: FormGroup;
  constructor(private duesService: DuesService, public dialog: MatDialog, private fb: FormBuilder, private router: Router, private paginators: MatPaginatorIntl, private servicesService: ServicesService,
    private route: ActivatedRoute, private cdr: ChangeDetectorRef, private patientsService: PatientsService) {

    this.paginators.itemsPerPageLabel = "Registros por página";
    this.paginators.nextPageLabel = "Siguiente página";
    this.paginators.previousPageLabel = "Página anterior";
    this.paginators.lastPageLabel = "Ultima página";
    this.paginators.firstPageLabel = "Primera página";

    this.paginators.getRangeLabel = (page, pageSize, length) => {
      return this.spanishRangeLabel(page, pageSize, length);
    };

    this.dueForm = this.fb.group({
      patientId: ['', Validators.required],
      name:['', Validators.required],
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
    this.dataSource.paginator = this.paginator;
    this.getAllPatients();
    this.getAllServices();
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

  deleteDue(id: string) {
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
    const duePromises = dues.map(async (due:any) => {
      const patientName = await this.getPatientNameById(due.patientId);
      const serviceName = await this.getServiceById(due.serviceId);
      return {
        ...due,
        patientId: patientName, 
        serviceId: serviceName
      };
    });

    this.dueList = await Promise.all(duePromises);
    this.dataSource.data = this.dueList;

  });
}

  getPatientNameById(id:number): Promise<string> {
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

  getServiceById(id:number): Promise<string> {
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
  

  gettingId(id: number): void {
    this.dueId = id;
  }

  gettingIdAndOpenModal(id: number): void {

    this.updating = true;
    this.dueId = id;
    this.openModal(this.modalContent, id);
  }

  loadDuesDetails(id: number) {
    this.updating = true;
    this.duesService.getDueById(id).subscribe(
      (due: any) => {
        const duePatch: Dues = due;
        const dueQuantity = this.getServiceById(due.serviceId);
        const duePatient = this.getPatientNameById(due.serviceId);
        this.dueForm.patchValue({
          patientId: duePatch.patientId,
          serviceId: duePatch.serviceId,
          dueQuantity: duePatch.dueQuantity,
          totalCost: duePatch.totalCost
        });

        this.cdr.detectChanges();
      },
      error => console.error(error)
    );
  }

  


  openModal(templateRef: TemplateRef<any>, id?: number): void {

    if (!id) {
      this.updating = false;
      this.dueId = 0;
      this.dueForm.reset();
    } else {
      this.updating = true;
      this.dueId = id;
      this.loadDuesDetails(id);
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
    this.closeModal();
  }

  redirectToEdit(id: string): void {
    this.router.navigate(['/services/editService', id]);
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
        this.getAllDues();
      },
      error: (error: any) => {
        console.error('Error al crear la cuota:', error);
      }
    });
  }

  submitForm() {
    if (this.dueForm.valid) {
      const formValue = this.dueForm.value;

      if (this.dueId) {
        this.updateDue(formValue, this.dueId)
        this.closeModal();
      } else {
        this.createDue(formValue);
        this.closeModal();
      }

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

