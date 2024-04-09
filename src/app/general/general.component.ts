import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Appointment } from '../shared/interfaces/appointment.interface';
import { AppointmentService } from '../shared/services/appointment.service';
import { PatientsService } from '../shared/services/patient.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Patient } from '../shared/interfaces/patient.interface';

export interface Menu {
  title: string;
  quantity: number;
  color: string;
  bold: string;
}

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss']
})
export class GeneralComponent implements OnInit, AfterViewInit {
  public loading:Boolean = false;
  public appointmentWeekNumber: number = 0;
  public totalPatientNumber: number = 0;
  notesText: string = '';
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
      quantity: this.appointmentWeekNumber,
      color: "#1950DD",
      bold: '500'
    },
    {
      title: "Cantidad de pacientes",
      quantity: this.totalPatientNumber,
      color: "#DDB219",
      bold: '500'
    },
    {
      title: "Gastos este mes",
      quantity: "- RD $ 9400",
      color: "#DD1919",
      bold: '500'
    },
    {
      title: "Ventas realizadas<br>este mes",
      quantity: 37,
      color: "#87DD19",
      bold: '500'
    },
  ]
  constructor(
    private appointmentService: AppointmentService,
    private patientService: PatientsService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.getAllAppointments();
    this.getAllPatients();
    setTimeout(()=>{
      this.loading = false;
    }, 200)
  }

  onContentChange(event: Event) {
    const target = event.target as HTMLDivElement;
    this.notesText = target.innerText;
    console.log(this.notesText)
  }

  getAllAppointments() {
    this.appointmentService.getAppointments().subscribe({
      next: (appointments: any) => {
        this.appointments = appointments;
        this.dataSource.data = this.appointments;
        this.generalFilter();
        this.appointmentWeek();
      },
      error: (error) => {
        console.error(error);
      }
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
        console.log(this.totalPatientNumber)
      }
    })
  }

  

}
