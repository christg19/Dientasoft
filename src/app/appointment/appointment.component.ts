import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Appointment } from '../shared/interfaces/appointment.interface';
import { AppointmentService } from '../shared/services/appointment.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientsService } from '../shared/services/patient.service';
import { Patient } from '../patients/patients.component';
import { ServicesService } from '../shared/services/services.service';
import { Service } from '../shared/interfaces/services.interface';

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss']
})
export class AppointmentComponent implements AfterViewInit {
  appointmentData = undefined;
  appointmentHour = undefined;
  redirectToClient = '/patients'
  redirectToServices = '/services'
  appointmentList: Appointment[] = []
  servicesList: Service[] = []
  appointmentForm!: FormGroup;
  displayedColumns: string[] = ['date', 'patientName', 'procedure', 'amount'];
  dataSource = new MatTableDataSource<Appointment>(this.appointmentList);
  patientList: Patient[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private router: Router, private paginators: MatPaginatorIntl, private appointmentService: AppointmentService, private fb: FormBuilder, private patientService: PatientsService, private servicesService: ServicesService) {
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
      appointmentHour:['', Validators.required],
      serviceIds: [[], [Validators.required]],
      patientId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.getAllAppointments();
    this.getAllPatients();
    this.getAllServices();

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
  submitForm() {
    if (this.appointmentForm.valid) {
      const formValue = this.appointmentForm.value;
  
      if (formValue.appointmentDate && formValue.appointmentHour) {
        const date = new Date(formValue.appointmentDate);
        const timeParts = formValue.appointmentHour.match(/(\d+):(\d+) (\w+)/);
        let hours = parseInt(timeParts[1], 10);
        const minutes = parseInt(timeParts[2], 10);
        const ampm = timeParts[3];
  
        // Convierte a formato de 24 horas
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
  
        if (!isNaN(date.getTime())) { // Verifica que 'date' sea una fecha válida
          date.setHours(hours, minutes);
  
          const submission = {
            ...formValue,
            appointmentDate: date.toISOString() // Usa la fecha y hora combinadas
          };
  
          this.appointmentService.createAppointment(submission).subscribe({
            next: (response: any) => {
              console.log('Cita creada exitosamente:', response);
              this.router.navigate(['/appointment']);
            },
            error: (error: any) => {
              console.error('Error al crear la cita:', error);
            }
          });
        } else {
          console.error('La fecha del formulario no es válida.');
        }
      } else {
        console.error('La fecha y/o la hora no están definidas.');
      }
    } else {
      console.log('El formulario no es válido. Detalles de los errores:');
      Object.keys(this.appointmentForm.controls).forEach(key => {
        const controlErrors = this.appointmentForm.get(key)?.errors;
        if (controlErrors != null) {
          Object.keys(controlErrors).forEach(keyError => {
            console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
          });
        }
      });
    }
  }
  
  
  }





