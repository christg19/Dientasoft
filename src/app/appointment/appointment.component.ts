import { AfterViewInit, ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Appointment } from '../shared/interfaces/appointment.interface';
import { AppointmentService } from '../shared/services/appointment.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientService } from '../shared/services/patient.service';
import { Patient } from '../shared/interfaces/patient.interface';
import { ServicesService } from '../shared/services/services.service';
import { Service } from '../shared/interfaces/services.interface';
import { MatDialog, MatDialogRef, MatDialogState } from '@angular/material/dialog';
import { Dues, SelectableObject, ServiceOrDue } from '../shared/interfaces/dues.interface';
import { lastValueFrom } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';
import { DuesService } from '../shared/services/dues.service';
import { ColumnDefinition } from '../base-grid-component/base-grid-component.component';
import { apiRoutes } from '../shared/const/backend-routes';

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss']
})
export class AppointmentComponent implements AfterViewInit {
  appointmentList: Appointment[] = []
  appointment?: Appointment;
  buttonAppointment: string[] = ['Registrar cita', 'Actualizar Cita']
  public updating: boolean = false;
  appointmentId!: number;
  displayedColumns: string[] = ['date', 'patientName', 'procedure', 'amount', 'actions'];
  dataSource = new MatTableDataSource<Appointment>(this.appointmentList);
  patientList: Patient[] = [];
  loading: Boolean = false;
  appointmentServicesName: string[] = [];
  dialogRef!: MatDialogRef<any>;
  appointmentForm!: FormGroup;
  redirectToClient = '/patients';
  redirectToServices = '/services';
  servicesList: Service[] = [];
  duesList!: Dues[];
  selectedDue!: Dues;
  combinedList: (Service | (Dues & { itemType: 'service' | 'due' }))[] = [];
  totalDues!: number;
  public componentDueCost: number = 0;
  public reduceCost: number = 0;
  selectedDues!: Dues[];
  isDataValid: boolean = false;
  selectedServices!: ServiceOrDue[]

  public columnDefs: ColumnDefinition[] = [
    //{ key: 'id', label: 'ID', dataType: 'number', editable: false },
    {key:'appointmentDate', label: 'Fecha', dataType: 'date', date: true},
    {key: 'patientName', label: 'Nombre', dataType: 'string'},
    {key:'serviceIds', label:'Servicios', dataType: 'array', function: 'service', editable:true},
    {key:'totalCost', label: 'Costo total', dataType: 'number'}
  ];
  public appointmentRoute = apiRoutes.appointment.main;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;
  

  constructor(
    private fb: FormBuilder,
    private router: Router, 
    public dialog: MatDialog, 
    private cdr: ChangeDetectorRef, 
    private servicesService: ServicesService, 
    private paginators: MatPaginatorIntl, 
    private appointmentService: AppointmentService, 
    private patientService: PatientService, 
    private duesService: DuesService) 
    {
    this.paginators.itemsPerPageLabel = "Registros por página";
    this.paginators.nextPageLabel = "Siguiente página";
    this.paginators.previousPageLabel = "Página anterior";
    this.paginators.lastPageLabel = "Ultima página";
    this.paginators.firstPageLabel = "Primera página";

    this.paginators.getRangeLabel = (page, pageSize, length) => {
      return this.spanishRangeLabel(page, pageSize, length);
    };

    this.appointmentForm = this.fb.group({
      appointmentDate: [Date, Validators.required],
      appointmentHour: ['', Validators.required],
      serviceIds: [[], [Validators.required]],
      patientId: ['', Validators.required],
      notes: [''],
    });
    
  }

  ngOnInit(): void {
    this.loading = true;
    this.getAllAppointments();
    this.getAllPatients();
    this.getAllServices();
  
    setTimeout(() => {
      this.loading = false;
    }, 200)
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }


  combineLists(duesList: Dues[], serviceList: Service[]) {
    this.combinedList = [
      ...serviceList.map(item => ({ ...item, itemType: 'service' as 'service' })),
      ...duesList.filter(due => due.dueQuantity > 0)
        .map(due => ({ ...due, itemType: 'due' as 'due' }))
    ];
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

  redirect(url: string) {
    if (this.dialogRef && this.dialogRef.getState() !== MatDialogState.CLOSED) {
      this.closeModal();
      this.router.navigate([url]);
      return;
    }

    this.router.navigate([url])
  }



  addingDues(id: number) {
    if (id === null || id === undefined) {
      console.error('No encontrado');
      return;
    }
  
    this.patientService.getPatientById(id).subscribe(async (patient: any) => {
      this.duesList = patient && patient.dues ? patient.dues : [];
      this.combineLists(this.duesList, this.servicesList);
    }, error => {
      console.error('Error fetching patient with id:', id, error);
    });
  }
  



  onSelectionChange(event: MatSelectChange) {
    const selectedItems = event.value;
    console.log(selectedItems);
    this.selectedDues = selectedItems.filter((item: SelectableObject) => item.itemType === 'due');
  
    this.selectedServices = selectedItems.filter((item: SelectableObject) => item.itemType === 'service');
  }
  





  getAllAppointments() {
    this.appointmentService.getAppointments().subscribe({
      next: (appointment: any) => {
        this.appointmentList = appointment;
        this.dataSource.data = this.appointmentList;
        this.dataSource.paginator = this.paginator; 
      },
      error: (error) => {
        console.error(error);
      }
    })
  }


  formatDate(date: string) {
    const fecha = new Date(date);
    const year = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    let hora = fecha.getHours();
    let minutes = fecha.getMinutes();

    const periodo = hora >= 12 ? 'PM' : 'AM';

    if (hora > 12) {
      hora -= 12;
    } else if (hora === 0) {
      hora = 12;
    }

    const horaFormateada = `${hora}:${minutes} ${periodo}`;
    const fechaFormateada = `${year}-${mes}-${dia} / ${horaFormateada}`;

    return fechaFormateada;
  }

  gettingId(id: number): void {
    this.appointmentId = id;
  }

  gettingIdAndOpenModal(id: string): void {
    this.redirect(`/appointment/updateAppointment/${id}`)
  }


  loadAppointmentDetails(id: number) {
    this.updating = true;
    this.appointmentService.getAppointmentById(id).subscribe(
      (appointment: any) => {
        const appointmentData: Appointment = appointment;
        const appointmentDateTime = new Date(appointmentData.appointmentDate);

        const appointmentDate = appointmentDateTime.toISOString().substring(0, 10);
        const hours = appointmentDateTime.getHours().toString().padStart(2, '0');
        const minutes = appointmentDateTime.getMinutes().toString().padStart(2, '0');
        const appointmentHour = `${hours}:${minutes}`;


        this.appointmentForm.patchValue({
          appointmentDate: appointmentDate,
          appointmentHour: appointmentHour,
          serviceIds: appointmentData.serviceIds,
          patientId: appointmentData.patientId,
          patientName: appointmentData.patientName,
        });


        this.cdr.detectChanges();
      },
      error => console.error(error)
    );
  }

  getAppointmentService(ids: number[]) {
    let servicesNames: string[] = [];

    const matchedServices = this.servicesList.filter(service => ids.includes(service.id));

    matchedServices.forEach((service: Service) => {
      servicesNames.push(service.name)
    })

    return servicesNames.join(', ');
  }


  deleteAppointment(id: number) {
    this.appointmentService.deleteAppointment(id).subscribe({
      next: (response: any) => {
        console.log('Cita eliminada con éxito:', response);
        this.getAllAppointments();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al eliminar la cita:', error);
      }
    });
  }


  getAllServices() {
    this.servicesService.getServices().subscribe({
      next: (services: any) => {
        this.servicesList = services;
        console.log(services)
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  getAllPatients() {
    this.patientService.getPatients().subscribe({
      next: (patients: any) => {
        this.patientList = patients;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  openModal(templateRef: TemplateRef<any>, id?: number): void {

    if (!id) {
      this.updating = false;
      this.appointmentId = 0;
      this.appointmentForm.reset();
      console.log('Creando nueva cita');
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

  updateDue(due: Dues, id: number) {
    this.duesService.updateDue(due, id).subscribe({
      next: (response: any) => {
        console.log('Updateado, ', response)
      }
    })
  }

  filterServices(list: ServiceOrDue[]): (number | string)[] {
    return list.map(item => {
      if (item.itemType === 'service') {
        return item.id;
      } else if (item.itemType === 'due') {
        return item.serviceId;
      }
      return undefined;
    }).filter(id => id !== undefined) as (number | string)[];
  }

  async filterServiceCost(): Promise<number> {
    if (!this.selectedServices || this.selectedServices.length === 0) {
      return 0; 
    }

  
    return this.selectedServices
      .filter(item => item.itemType === 'service') 
      .reduce((acc, service) => {
        if ('cost' in service) { 
          return acc + service.cost;
        }
        return acc;
      }, 0);
  }

  async updateDueQuantities(dues: Dues[]): Promise<void> {
    const updatePromises = dues.map(due => {
      if (due.dueQuantity > 0 && due.id !== undefined) {
        const decrement = due.totalCost / due.dueQuantity;
        return this.duesService.patchDue(due.id, {
          dueQuantity: due.dueQuantity - 1,
          totalCost: due.totalCost - decrement
        }).toPromise();
      } else {
        console.error('Intento de actualizar un Due sin ID válido o con dueQuantity no positiva.');
        return Promise.reject('ID inválido o dueQuantity no positiva');
      }
    });
  
    try {
      await Promise.all(updatePromises);
      console.log("Todos los Dues han sido actualizados correctamente.");
    } catch (error) {
      console.error('Hubo un error al actualizar los Dues:', error);
      throw error;
    }
  }
  
  async dueCost(selectedDues: Dues[]): Promise<number> {
    let totalDueCost = 0;
    for (const due of selectedDues) {
      if (due.itemType === 'due') {
        totalDueCost += due.totalCost / due.dueQuantity;
      }
    }
    this.componentDueCost = totalDueCost;
    return totalDueCost;
  }


  async submitForm() {
    if (!this.appointmentForm.valid) {
      console.error('El formulario no es válido. Detalles de los errores:');
      return;
    }
  
    const formValue = this.appointmentForm.getRawValue();
  
    try {
      let dueCost = 0;
  
      if (this.selectedDues && this.selectedDues.length > 0) {
        await this.updateDueQuantities(this.selectedDues);
        dueCost = await this.dueCost(this.selectedDues);
      }
  
      const serviceTotalCost = await this.filterServiceCost();
  
      const date = new Date(formValue.appointmentDate);
      const [hours, minutes] = formValue.appointmentHour.split(':').map(Number);
      date.setHours(hours, minutes);
  
      const totalCost = dueCost + serviceTotalCost;
  
      const submission = {
        ...formValue,
        serviceIds: this.filterServices(formValue.serviceIds),
        duesCost: dueCost,
        totalCost: totalCost,
        appointmentDate: date.toISOString()
      };
  
      delete submission.appointmentHour;
  
      if (this.updating) {
        console.log('Actualizando cita');
        await lastValueFrom(this.appointmentService.updateAppointment(submission, this.appointmentId));
      } else {
        console.log('Creando nueva cita');
        console.log(submission);
        await lastValueFrom(this.appointmentService.createAppointment(submission));
      }
  
      this.closeModal();
      this.getAllAppointments();
      this.updating = false;
  
    } catch (error) {
      console.error('Error al procesar la cita o actualizar los Dues:', error);
    }
  }
  

  compareFn(o1: any, o2: any): boolean {
    if (!o1 || !o2) {
      return false;
    }
    return o1.id === o2.id;
  }

}





