import { AfterViewInit, Component, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss']
})
export class AppointmentComponent implements AfterViewInit {

 
  appointmentList: Appointment[] = []

  displayedColumns: string[] = ['date', 'patientName', 'procedure', 'amount'];
  dataSource = new MatTableDataSource<Appointment>(this.appointmentList);
  patientList: Patient[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private router: Router, private paginators: MatPaginatorIntl, private appointmentService: AppointmentService, private patientService: PatientsService, ) {
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
    this.getAllAppointments();
    this.getAllPatients();
    

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

  
  
  
  }





