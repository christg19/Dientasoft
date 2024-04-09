import { AfterViewInit, ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Appointment } from '../shared/interfaces/appointment.interface';
import { AppointmentService } from '../shared/services/appointment.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientsService } from '../shared/services/patient.service';
import { Patient } from '../shared/interfaces/patient.interface';
import { ServicesService } from '../shared/services/services.service';
import { Service } from '../shared/interfaces/services.interface';
import { MatDialog, MatDialogRef, MatDialogState } from '@angular/material/dialog';

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
  appointmentId: string = '';
  displayedColumns: string[] = ['date', 'patientName', 'procedure', 'amount', 'actions'];
  dataSource = new MatTableDataSource<Appointment>(this.appointmentList);
  patientList: Patient[] = [];
  loading:Boolean = false;
  appointmentServicesName: string[] = [];
  dialogRef!: MatDialogRef<any>;
  appointmentForm!: FormGroup;
  redirectToClient = '/patients';
  redirectToServices = '/services';
  servicesList: Service[] = [];


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;

  constructor(
    private fb: FormBuilder,
    private router: Router, public dialog: MatDialog, private cdr: ChangeDetectorRef, private servicesService: ServicesService, private paginators: MatPaginatorIntl, private appointmentService: AppointmentService, private patientService: PatientsService,) {
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
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.getAllAppointments();
    this.getAllPatients();
    this.getAllServices();
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

  redirect(url: string) {
    if (this.dialogRef && this.dialogRef.getState() !== MatDialogState.CLOSED) {
      this.closeModal();
      this.router.navigate([url]);
      return;
    }

    this.router.navigate([url])
  }

  getAllAppointments() {
    this.appointmentService.getAppointments().subscribe({
      next: (appointment: any) => {
        console.log(appointment)
        this.appointmentList = appointment;
        this.dataSource.data = this.appointmentList;

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

  gettingId(id: string): void {
    this.appointmentId = id;
  }

  gettingIdAndOpenModal(id: string): void {
    console.log(id, 'gettingIdAndOpenModal');
    this.updating = true;
    this.appointmentId = id;
    this.openModal(this.modalContent, id);
  }


  loadAppointmentDetails(id: string) {
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

  getAppointmentService(ids: string[]) {
    let servicesNames: string[] = [];

    const matchedServices = this.servicesList.filter(service => ids.includes(service.id));

    matchedServices.forEach((service: Service) => {
      servicesNames.push(service.name)
    })

    return servicesNames.join(', ');
  }


  deleteAppointment(id: string) {
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

  openModal(templateRef: TemplateRef<any>, id?: string): void {

    if (!id) {
      this.updating = false;
      this.appointmentId = '';
      this.appointmentForm.reset();
      console.log('Creando nueva cita');
    } else {
      this.updating = true;
      this.appointmentId = id;
      this.loadAppointmentDetails(id);
      console.log('Editando cita existente');
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

  submitForm() {
    if (this.appointmentForm.valid) {
      console.log(this.updating)
      const formValue = this.appointmentForm.getRawValue();

      if (formValue.appointmentDate && formValue.appointmentHour) {

        const date = new Date(formValue.appointmentDate);
        const [hours, minutes] = formValue.appointmentHour.split(':').map(Number);
        date.setHours(hours, minutes);

        const submission = {
          ...formValue,
          appointmentDate: date.toISOString()
        };
        delete submission.appointmentHour;

        if (this.updating) {
          console.log('Actualizando')
          this.appointmentService.updateAppointment(submission, this.appointmentId).subscribe({
            next: (response: any) => {
              console.log('Cita actualizada exitosamente:', response);

              this.closeModal();
              this.getAllAppointments();
              this.updating = false;
              this.cdr.detectChanges();
            },
            error: (error: any) => console.error('Error al actualizar la cita:', error)
          });
        } else {
          console.log('Creando')
          this.appointmentService.createAppointment(submission).subscribe({
            next: (response: any) => {
              console.log('Cita creada exitosamente:', response);
              this.closeModal();
              this.getAllAppointments();
              this.cdr.detectChanges();
            },
            error: (error: any) => console.error('Error al crear la cita:', error)
          });
        }
      } else {
        console.error('La fecha y/o la hora no están definidas.');
      }
    } else {
      console.log('El formulario no es válido. Detalles de los errores:');
    }
  }

  compareFn(a: any, b: any): boolean {
    return a === b;
  }


}





