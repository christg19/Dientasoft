import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Appointment } from '../shared/interfaces/appointment.interface';
import { AppointmentService } from '../shared/services/appointment.service';
import { PatientService } from '../shared/services/patient.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Patient } from '../shared/interfaces/patient.interface';
import { ServicesService } from '../shared/services/services.service';
import { Service } from '../shared/interfaces/services.interface';
import { firstValueFrom } from 'rxjs';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';


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
  items = [
    { label: 'General', link: '/general' },
    { label: 'Estadísticas', link: '/citas' },
  ];

  home = { icon: 'pi pi-home', link: '/' };
  
  chartType1: ChartType = 'bar';
  chartData1: ChartData<'bar'> = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
      datasets: [
          {
              label: 'Servicios Realizados',
              data: [10, 20, 30, 40, 50],
              backgroundColor: ['#4A90E2', '#50E3C2', '#F5A623', '#E94E77', '#8E44AD'],
          },
      ],
  };
  
  chartType2: ChartType = 'pie';
  chartData2: ChartData<'pie'> = {
      labels: ['Limpieza Dental', 'Ortodoncia', 'Blanqueamiento'],
      datasets: [
          {
              data: [45, 25, 30],
              backgroundColor: ['#4A90E2', '#50E3C2', '#F5A623'],
          },
      ],
  };
  
  chartType3: ChartType = 'line'; 
  chartData3: ChartData<'line'> = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
      datasets: [
          {
              label: 'Ingresos Totales',
              data: [1000, 2000, 3000, 4000, 5000],
              borderColor: '#4A90E2',
              fill: false,
          },
      ],
  };
  
  chartOptions2: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
            display: true,
            labels: {
                font: {
                    family: 'Mulish, sans-serif', // Cambia la fuente
                    size: 14, // Tamaño del texto
                   
                },
                color: '#333333', // Color del texto de la leyenda
            },
        },
    },
  };
  
  chartOptions3: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
            display: true,
            labels: {
                font: {
                    family: 'Mulish, sans-serif', // Cambia la fuente
                    size: 14, // Tamaño del texto
                    
                },
                color: '#333333', // Color del texto de la leyenda
            },
        },
    },
  };

  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
          display: true,
          labels: {
              font: {
                  family: 'Mulish, sans-serif', // Cambia la fuente
                  size: 14, // Tamaño del texto
                 
              },
              color: '#333333', // Color del texto de la leyenda
          },
      },
  },
};
  

  dataSource = new MatTableDataSource<any>(this.appointments);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  public optionMenu = [
    {
      title: "Citas Pendientes",
      value: '21',
      color: "#1950DD",
      icon: 'schedule'
    },
    {
      title: "Citas Completadas",
      value: '132',
      color: "#DDB219",
      icon: 'check_circle_outline'
    },
    {
      title: "Servicio Popular",
      value: "Limpieza Dental",
      color: "#DD1919",
      icon: 'star_border'
    },
    {
      title: "Ganancia Total",
      value: '37,900',
      color: "#87DD19",
      icon: 'attach_money'
    },
  ]
  constructor(
    private appointmentService: AppointmentService,
    private patientService: PatientService,
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
