import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Appointment, AppointmentStatus } from '../shared/interfaces/appointment.interface';
import { AppointmentService } from '../shared/services/appointment.service';
import { PatientService } from '../shared/services/patient.service';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Patient } from '../shared/interfaces/patient.interface';
import { ServicesService } from '../shared/services/services.service';
import { Service } from '../shared/interfaces/services.interface';
import { filter, firstValueFrom, map } from 'rxjs';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { Dues } from '../shared/interfaces/dues.interface';
import { DuesService } from '../shared/services/dues.service';

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
  public paginatorButton: Boolean = true;
  public pendingAppointments: number = 0;
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
            family: 'Mulish, sans-serif',
            size: 14,

          },
          color: '#333333',
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
            family: 'Mulish, sans-serif',
            size: 14,

          },
          color: '#333333',
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
            family: 'Mulish, sans-serif',
            size: 14,

          },
          color: '#333333',
        },
      },
    },
  };

  dataSource = new MatTableDataSource<any>(this.appointments);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;

    this.checkPaginatorButton();

    this.dataSource.connect().subscribe((data) => {
      this.checkPaginatorButton(data);
    });
  }

  checkPaginatorButton(data?: any[]): void {
    const dataLength = data ? data.length : this.dataSource.data.length;
    this.paginatorButton = dataLength > 5;
  }

  public optionMenu = [
    {
      title: "Citas Pendientes",
      value: this.countAppointments(0),
      color: "#1950DD",
      icon: 'schedule'
    },
    {
      title: "Citas Completadas",
      value: this.countAppointments(1),
      color: "#DDB219",
      icon: 'check_circle_outline'
    },
    {
      title: "Servicio Popular",
      value: this.getMostPopularService(),
      color: "#DD1919",
      icon: 'star_border'
    },
    {
      title: "Ganancia Total",
      value: this.getTotalEarnings(),
      color: "#87DD19",
      icon: 'attach_money'
    },
  ];

  constructor(
    private paginators: MatPaginatorIntl,
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private servicesService: ServicesService,
    private duesService: DuesService
  ) {

    this.paginators.itemsPerPageLabel = "Registros por página";
    this.paginators.nextPageLabel = "Siguiente página";
    this.paginators.previousPageLabel = "Página anterior";
    this.paginators.lastPageLabel = "Última página";
    this.paginators.firstPageLabel = "Primera página";

    this.paginators.getRangeLabel = (page, pageSize, length) => {
      return this.spanishRangeLabel(page, pageSize, length);
    };

  }

  async ngOnInit(): Promise<void> {
    this.loading = true;

    await this.getServices();
    await this.getAllAppointments();
    await this.getAllPatients();

    await this.updateBarChart();
    await this.updatePieChart();
    await this.updateLineChart();

    this.loading = false;
  }

  spanishRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex =
      startIndex < length
        ? Math.min(startIndex + pageSize, length)
        : startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} de ${length}`;
  }

  async updateBarChart(): Promise<void> {

    const appointments = (await this.appointmentService.getAppointments().toPromise()) || [];
    const completedAppointments = appointments.filter((appointment: Appointment) => appointment.status === 1);

    const monthlyServices: { [key: string]: number } = {};
    completedAppointments.forEach((appointment) => {
      const month = new Date(appointment.appointmentDate).toLocaleString('es', { month: 'long' });
      monthlyServices[month] = (monthlyServices[month] || 0) + 1;
    });

    this.chartData1 = {
      labels: Object.keys(monthlyServices),
      datasets: [
        {
          label: 'Servicios Realizados',
          data: Object.values(monthlyServices),
          backgroundColor: ['#4A90E2', '#50E3C2', '#F5A623', '#E94E77', '#8E44AD'],
        },
      ],
    };
  }

  async updatePieChart(): Promise<void> {

    const appointments = (await this.appointmentService.getAppointments().toPromise()) || [];
    const dues = (await firstValueFrom(this.duesService.getDues())) || [];

    const serviceCounts: { [key: string]: number } = {};

    appointments.forEach((appointment) => {
      appointment.serviceIds.forEach((serviceId) => {
        const serviceName = this.serviceList.find((service) => service.id === serviceId)?.name || 'Desconocido';
        serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
      });
    });

    dues.forEach((due) => {
      const serviceName = this.serviceList.find((service) => service.id === Number(due.serviceId))?.name || 'Desconocido';
      serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
    });

    this.chartData2 = {
      labels: Object.keys(serviceCounts),
      datasets: [
        {
          data: Object.values(serviceCounts),
          backgroundColor: ['#4A90E2', '#50E3C2', '#F5A623', '#E94E77', '#8E44AD'],
        },
      ],
    };
  }

  async updateLineChart(): Promise<void> {

    const appointments = (await this.appointmentService.getAppointments().toPromise()) || [];
    const dues = (await firstValueFrom(this.duesService.getDues())) || [];

    const monthlyEarnings: { [key: string]: number } = {};

    appointments.forEach((appointment) => {
      const month = new Date(appointment.appointmentDate).toLocaleString('es', { month: 'long' });
      monthlyEarnings[month] = (monthlyEarnings[month] || 0) + (appointment.totalCost || 0);
    });

    dues.forEach((due) => {
      const month = new Date(due.createdAt).toLocaleString('es', { month: 'long' });
      const quotaPortion = due.totalCost / due.dueQuantity;
      monthlyEarnings[month] = (monthlyEarnings[month] || 0) + quotaPortion;
    });

    this.chartData3 = {
      labels: Object.keys(monthlyEarnings),
      datasets: [
        {
          label: 'Ingresos Totales',
          data: Object.values(monthlyEarnings),
          borderColor: '#4A90E2',
          fill: false,
        },
      ],
    };
  }

  onContentChange(event: Event) {
    const target = event.target as HTMLDivElement;
    this.notesText = target.innerText;
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

      this.generalFilter();
      this.appointmentWeek();
    });
  }

  async countAppointments(status: number): Promise<number> {
    const pendingCount = await firstValueFrom(
      this.appointmentService.getAppointments().pipe(
        map((appointments: Appointment[]) =>
          appointments.filter(appointment => appointment.status === status).length
        )
      )
    );
    this.pendingAppointments = pendingCount;
    return pendingCount;
  }

  async getMostPopularService(): Promise<string> {

    const appointments = await this.appointmentService.getAppointments().toPromise();

    if (!appointments || appointments.length === 0) {
      return 'No disponible';
    }

    const dues = await firstValueFrom(this.duesService.getDues());

    const serviceCounts: { [key: number]: number } = {};

    const completedAppointments = appointments.filter((appointment: Appointment) => appointment.status === 1);

    for (const appointment of completedAppointments) {
      if (appointment.serviceIds && Array.isArray(appointment.serviceIds)) {
        for (const serviceId of appointment.serviceIds) {
          serviceCounts[serviceId] = (serviceCounts[serviceId] || 0) + 1;
        }
      } else {
        console.warn("La cita no tiene servicios:", appointment);
      }
    }

    for (const due of dues) {
      if (due.serviceId) {
        const serviceId = Number(due.serviceId);
        serviceCounts[serviceId] = (serviceCounts[serviceId] || 0) + 1;
      } else {
        console.warn("La cuota no tiene un serviceId válido:", due);
      }
    }

    let mostPopularServiceId: number | null = null;
    let maxCount = 0;

    for (const [serviceId, count] of Object.entries(serviceCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostPopularServiceId = Number(serviceId);
      }
    }

    if (mostPopularServiceId === null) {
      return 'No disponible';
    }

    try {
      const service = await firstValueFrom(this.servicesService.getServiceById(mostPopularServiceId));
      return service.name;
    } catch (error) {
      console.error('Error al obtener el servicio más popular:', error);
      return 'Error al obtener el nombre';
    }
  }


  async getTotalEarnings(): Promise<number> {

    const appointments = await this.appointmentService.getAppointments().toPromise();

    console.log("Citas obtenidas:", appointments);

    if (!appointments || appointments.length === 0) {
      console.log("No hay citas disponibles.");
      return 0;
    }

    const dues = await firstValueFrom(this.duesService.getDues());

    console.log("Cuotas obtenidas:", dues);

    const duesByService: { [key: string]: Dues } = {};
    dues.forEach((due) => {
      const serviceIdKey = String(due.serviceId);
      duesByService[serviceIdKey] = due;
    });

    console.log("Mapa de cuotas por servicio (duesByService):", duesByService);

    const totalEarnings = appointments.reduce((sum, appointment) => {
      console.log("Procesando cita:", appointment);

      if (appointment.serviceIds && appointment.serviceIds.length > 0) {

        for (const serviceId of appointment.serviceIds) {
          const serviceIdKey = String(serviceId);
          const due = duesByService[serviceIdKey];

          console.log(`Procesando servicio con ID: ${serviceIdKey}, Cuota encontrada:`, due);

          if (due && due.itemType === 'due') {
            if (due.dueQuantity && due.totalCost && due.dueQuantity > 0) {

              const quotaPortion = due.totalCost / due.dueQuantity;
              console.log(`Cuota válida - totalCost: ${due.totalCost}, dueQuantity: ${due.dueQuantity}, cuotaPortion: ${quotaPortion}`);
              sum += quotaPortion;
            } else {
              console.warn(`Datos inválidos en cuota:`, due);
            }
          } else {

            console.log(`Servicio normal - sumando totalCost: ${appointment.totalCost || 0}`);
            sum += appointment.totalCost || 0;
          }
        }
      }

      return sum;
    }, 0);

    console.log("Ganancia total calculada:", totalEarnings);

    return totalEarnings;
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

    return Promise.resolve(names);
  }



}
