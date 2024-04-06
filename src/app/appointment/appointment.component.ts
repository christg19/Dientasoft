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
  private updating: boolean = false;
  appointmentId: string = '';
  displayedColumns: string[] = ['date', 'patientName', 'procedure', 'amount', 'actions'];
  dataSource = new MatTableDataSource<Appointment>(this.appointmentList);
  patientList: Patient[] = [];
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
    });
  }

  ngOnInit(): void {
    this.getAllAppointments();
    this.getAllPatients();
    this.getAllServices();
    this.cdr.detectChanges();
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
    this.updating = true;
    this.appointmentId = id;
    this.loadAppointmentDetails(id);
    this.openModal(this.modalContent);
  }


  loadAppointmentDetails(id: string) {
    this.updating = true;
    console.log(id)
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
          notes: appointmentData.notes,
          servicesName: appointmentData.servicesName,
          patientId: appointmentData.patientId,
          patientName: appointmentData.patientName,
        });
      },
      error => console.error(error)
    );
  }

  

  deleteAppointment(id: string) {
    this.appointmentService.deleteAppointment(id).subscribe({
      next: (response: any) => {
        console.log('Cita eliminada con éxito:', response);
        this.getAllAppointments();
        this.cdr.detectChanges();
        window.location.reload()
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
    if (!this.updating) {
      this.appointmentForm.reset();
      this.appointmentId = '';
    }
    
    this.dialogRef = this.dialog.open(templateRef, { width: '400px', height: '500px' });

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }


  closeModal(): void {
    this.dialogRef.close();
    this.updating = false; // Asegúrate de restablecer el estado de actualización al cerrar el modal
  }

  submitForm() {
    if (this.appointmentForm.valid) {
        const formValue = this.appointmentForm.getRawValue(); // Asegúrate de obtener todos los valores del formulario

        if (formValue.appointmentDate && formValue.appointmentHour) {
            // Construir la fecha y hora del appointment correctamente
            const date = new Date(formValue.appointmentDate);
            const [hours, minutes] = formValue.appointmentHour.split(':').map(Number);
            date.setHours(hours, minutes);

            // Preparar el objeto submission sin la propiedad appointmentHour directamente
            const submission = {
                ...formValue,
                appointmentDate: date.toISOString()
            };
            delete submission.appointmentHour; // Elimina la propiedad appointmentHour

            if (this.updating) {
                // Lógica para actualizar la cita, usando el ID almacenado
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



}





