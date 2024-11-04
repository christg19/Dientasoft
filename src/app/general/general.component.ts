import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Appointment } from '../shared/interfaces/appointment.interface';
import { AppointmentService } from '../shared/services/appointment.service';
import { PatientsService } from '../shared/services/patient.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Patient } from '../shared/interfaces/patient.interface';
import { ServicesService } from '../shared/services/services.service';
import { Service } from '../shared/interfaces/services.interface';
import { firstValueFrom } from 'rxjs';

export interface Menu {
  title: string;
  quantity: number;
  color: string;
  bold: string;
}

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss'],
})
export class GeneralComponent implements OnInit, AfterViewInit {
  public loading: Boolean = false;
  public appointmentWeekNumber: number = 0;
  public totalPatientNumber: number = 0;
  notesText: string = '';
  serviceList!: Service[];
  public appointments: Appointment[] = [];
  displayedColumns: string[] = ['date', 'patientName', 'procedure', 'amount'];
  dataSource = new MatTableDataSource<any>(this.appointments);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  optionMenu = [
    {
      title: "Citas pendientes<br>en la semana",
      value: '43',
      color: "#1950DD",
    },
    {
      title: "Cantidad de pacientes",
      value: '34',
      color: "#DDB219",
    },
    {
      title: "Gastos este mes",
      value: "- RD $ 9400",
      color: "#DD1919",
    },
    {
      title: "Ventas realizadas<br>este mes",
      value: '37',
      color: "#87DD19",
    },
  ]
  constructor(
    private appointmentService: AppointmentService,
    private patientService: PatientsService,
    private servicesService: ServicesService,
  ) { 
  }

  ngOnInit(): void {
    this.loading = true;
    this.getServices();
    this.getAllAppointments();
    this.getAllPatients();
    setTimeout(() => {
      this.loading = false;
    }, 200)
  }

  onContentChange(event: Event) {
    const target = event.target as HTMLDivElement;
    this.notesText = target.innerText;
    console.log(this.notesText)
  }

  async getAllAppointments() {
    this.appointmentService.getAppointments().subscribe(async (appointment: any) => {
      const appointmentPromise = appointment.map(async (appointment: any) => {
        const proceduresName = await this.getProceduresByIds(appointment.serviceIds);
        return {
          ...appointment,
          serviceIds: proceduresName.join(', ')
        }
      });
      this.appointments = await Promise.all(appointmentPromise);
      this.dataSource.data = this.appointments;
      console.log(this.appointments)
      this.generalFilter();
      this.appointmentWeek();
    });
  }


  generalFilter() {
    let today = new Date();
    const appointmentOfToday = this.appointments.filter((appointment) => {
      let appointmentDate = new Date(appointment.appointmentDate);
      return appointmentDate.getDate() === today.getDate() &&
        appointmentDate.getMonth() === today.getMonth() &&
        appointmentDate.getFullYear() === today.getFullYear();
    });

    this.dataSource.data = appointmentOfToday;
    console.log(this.dataSource.data)
  }

  appointmentWeek() {
    const current = new Date();
    const first = current.getDate() - current.getDay();
    const last = first + 6;

    const firstDayOfWeek = new Date(current.setDate(first));
    const lastDayOfWeek = new Date(current.setDate(last));

    const appointmentsThisWeek = this.appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate);
      return appointmentDate >= firstDayOfWeek && appointmentDate <= lastDayOfWeek;
    });

    this.appointmentWeekNumber = appointmentsThisWeek.length
  }

  getAllPatients() {
    this.patientService.getPatients().subscribe({
      next: (patients: any) => {
        console.log(patients)
        this.totalPatientNumber = patients.length;
      }
    })
  }

  getServices(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.servicesService.getServices().subscribe({
        next: (services: any) => {
          this.serviceList = services;
          resolve();
        },
        error: (error) => {
          console.error(error);
          reject();
        }
      });
    });
  }

  getProceduresByIds(ids: number[]): Promise<string[]> {
    if (!this.serviceList) {
      console.warn('serviceList is not loaded yet.');
      return Promise.resolve([]);
    }
  
    const names = this.serviceList
    .filter(service => ids.includes(service.id)) 
    .map(service => service.name);
    console.log("servicios: ", this.serviceList)
    console.log(names)
    return Promise.resolve(names);
  }



}
