import { ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Appointment } from 'src/app/shared/interfaces/appointment.interface';
import { Dues, SelectableObject, ServiceOrDue } from 'src/app/shared/interfaces/dues.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Patient } from 'src/app/shared/interfaces/patient.interface';
import { Service } from 'src/app/shared/interfaces/services.interface';
import { DuesService } from 'src/app/shared/services/dues.service';
import { Odontogram } from 'src/app/shared/interfaces/odontogram.interface';
import { Tooth } from 'src/app/shared/interfaces/tooth.interface';
import { apiRoutes } from 'src/app/shared/const/backend-routes';
import { BaseGridService } from 'src/app/shared/services/baseGrid.service';
import { ToothNames } from 'src/app/shared/const/enums/tooth.enum';
import { ServicesService } from 'src/app/shared/services/services.service';
import { AppointmentService } from 'src/app/shared/services/appointment.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ToothSVGComponent } from 'src/app/shared/components/tooth-svg/tooth-svg.component';

@Component({
  selector: 'app-create-appointment',
  templateUrl: './create-appointment.component.html',
  styleUrls: ['./create-appointment.component.scss'],
})
export class CreateAppointmentComponent {

  @ViewChild(ToothSVGComponent) toothSvgComponent!: ToothSVGComponent;

  selectedServiceIds: number[] = [];
  dueCostS: number = 0;

  private dialogRef!: MatDialogRef<any>;
  private endpointRoutes = apiRoutes;
  public firstPayment: number = 0;

  public appointmentForm!: FormGroup;
  public patientList: Patient[] = [];

  public appointmentList: Appointment[] = []
  public appointment?: Appointment;

  public buttonAppointment: string[] = ['Registrar cita', 'Actualizar Cita', 'Limpiar Cita']
  public displayedColumns: string[] = ['date', 'patientName', 'procedure', 'amount', 'actions'];
  public appointmentServicesName: string[] = [];
  public redirectToClient: string = '/patients'
  public redirectToServices: string = '/services'
  public currentStep = 1;

  public patientOdontogram!: Odontogram;

  public loading: Boolean = false;
  public updating: boolean = false;
  public isDataValid: boolean = false;

  public selectedDues: Dues[] = [];
  public duesList: Dues[] = [];
  public selectedDue: Dues | null = null;
  public combinedList: (Service | (Dues & { itemType: 'service' | 'due' }))[] = [];
  public servicesList: Service[] = []
  public selectedServices: ServiceOrDue[] = [];

  public patientId!: number;
  public componentDueCost: number = 0;
  public appointmentId!: number;
  public toothPositionArray: number[] = [];
  public totalDues!: number;
  public reduceCost: number = 0;
  public patientSelectedId!: number;

  public appointmentData = undefined;
  public appointmentHour = undefined;

  public duePaymentAmount: number = 0;

  public showDueInput: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private duesService: DuesService,
    private baseGridService: BaseGridService,
    private servicesService: ServicesService,
    private appointmentService: AppointmentService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute

  ) {
    this.appointmentForm = this.fb.group({
      appointmentDate: ['', Validators.required], 
      appointmentHour: ['', Validators.required],
      serviceIds: ['', Validators.required],   
      patientId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.getAllPatients();
    this.getAllServices()
      .then(() => {
        if (this.duesList || this.servicesList) {
          this.combineLists(this.duesList, this.servicesList);
        } else {
          console.log('Dues List está vacío');
        }

        this.appointmentId = Number(this.route.snapshot.paramMap.get('id') || '')
        if (this.appointmentId) {
          this.loadAppointmentDetails(this.appointmentId);
        }
      })
      .catch(error => console.error('Error cargando datos:', error))
      .finally(() => {
        this.loading = false;
      });
  }


  ngAfterViewInit() {

  }

  private showMessage(message: string, action: string = 'Cerrar', duration: number = 3000): void {
    this.snackBar.open(message, action, {
      duration,
      panelClass: ['minimal-snackbar']
    });
  }

  updateFirstPayment(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const payment = parseFloat(inputElement.value);

    if (isNaN(payment) || payment <= 0) {
      console.warn('Monto inválido para el primer pago');
      return;
    }

    this.firstPayment = payment;

    this.recalculateDues();
  }

  recalculateDues(): void {
    if (!this.selectedDues || this.selectedDues.length === 0) {
      return;
    }

    if (this.firstPayment <= 0) {
      console.warn('El monto del primer pago debe ser mayor que 0.');
      return;
    }

    this.selectedDues.forEach(due => {
      const originalTotalCost = due.originalTotalCost ?? due.totalCost;
      const remainingAmount = originalTotalCost - this.firstPayment;

      if (remainingAmount <= 0) {
        due.totalCost = 0;
      } else {
        due.totalCost = remainingAmount;
      }
    });

    console.log('Dues recalculadas:', this.selectedDues);
  }
  redirect(url: string) {
    this.router.navigate([url])
  }

  applyFilters(event: number) {

  }

  compareFn(o1: any, o2: any): boolean {
    if (!o1 || !o2) {
      return false;
    }
    return o1.id === o2.id;
  }

  getPatientId(id: number) {
    this.patientSelectedId = id;
  }

  combineLists(duesList: Dues[], serviceList: Service[]) {
    this.combinedList = [
      ...serviceList.map(item => ({
        ...item,
        itemType: 'service' as const,
      })),
      ...duesList.map(due => ({
        ...due,
        itemType: 'due' as const,
        name: `Cuota de ${due.name}`,
        totalCost: due.totalCost || 0,
      })),
    ];

    console.log('Combined List:', this.combinedList);
  }


  addingDues(event: Event) {
    const target = event.target as HTMLSelectElement;

    if (!target || !target.value) {
      console.error('No encontrado');
      return;
    }

    const id = parseInt(target.value, 10);

    this.patientId = id;

    this.baseGridService.getDataById(this.endpointRoutes.patient.main, id).subscribe(
      async (patient: any) => {
        this.duesList = patient?.dues || [];
        this.duesList = this.duesList.filter((due) =>{
         return due.totalCost !== 0;
        })
        console.log('Updated Dues List:', this.duesList);

        this.combineLists(this.duesList, this.servicesList);

        this.dueCostS = this.calculateDueCost(this.selectedDues);
        console.log('Recalculated Total Due Cost (dueCostS):', this.dueCostS);
      },
      (error) => {
        console.error('Error fetching patient with id:', id, error);
      }
    );
  }


  getIdAndCost(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    if (!selectElement || !selectElement.value) {
      return;
    }
    const selectedId = Number(selectElement.value);
  
    this.appointmentForm.get('serviceIds')?.setValue(selectedId);
  
    const selectedService = this.combinedList.find(item => item.id === selectedId);
  
    if (selectedService) {
      if (selectedService.itemType === 'service') {
        this.firstPayment = selectedService.cost;
        this.showDueInput = false;
        this.selectedDue = null;
      } else if (selectedService.itemType === 'due') {
        this.firstPayment = 0;
        this.showDueInput = true;
        this.selectedDue = selectedService as Dues;
      }
    }
  }
  
  clearForm(): void {

    this.appointmentForm.reset();

    // this.toothSvgComponent.clearAllSelectedTeethForm();
  
    this.duePaymentAmount = 0;
    this.showDueInput = false;
    this.selectedDue = null;

    this.toothPositionArray = [];

    this.showMessage('El formulario se ha limpiado correctamente.');
  }
  

  calculateDueCost(dueItems: any[]): number {
    return dueItems.reduce((total, item) => total + (item.cost || 0), 0);
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

  loadAppointmentDetails(id: number) {
    this.updating = true;
    this.baseGridService.getDataById(this.endpointRoutes.appointment.main, id).subscribe(
      (appointment: any) => {
        const appointmentData: Appointment = appointment;
        const appointmentDateTime = new Date(appointmentData.appointmentDate);

        const appointmentDate = appointmentDateTime.toISOString().substring(0, 10);
        const hours = appointmentDateTime.getHours().toString().padStart(2, '0');
        const minutes = appointmentDateTime.getMinutes().toString().padStart(2, '0');
        const appointmentHour = `${hours}:${minutes}`;

        const serviceObjects = this.combinedList.filter(item =>
          item.id !== undefined && appointmentData.serviceIds.includes(item.id)
        );

        this.appointmentForm.patchValue({
          appointmentDate: appointmentDate,
          appointmentHour: appointmentHour,
          serviceIds: serviceObjects,
          patientId: appointmentData.patientId,
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

  async getOdontogramByPatientId(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.baseGridService.getDataById(this.endpointRoutes.odontogram.main, id).subscribe({
        next: (data: any) => {
          this.patientOdontogram = data;
          resolve();
        },
        error: (error) => {
          console.error(error);
          reject(error);
        }
      });
    });
  }

  saveToothList(array: number[]) {
    this.toothPositionArray = array;
  }

  assignServicesToTooths(serviceIds: number[], odontogramId: number) {
    this.toothPositionArray.forEach((toothPosition: number) => {
      const existingTooth = this.patientOdontogram.tooth.find(
        (tooth: Tooth) => tooth.toothPosition === toothPosition
      );

      if (existingTooth) {

        existingTooth.serviceIds = [...(existingTooth.serviceIds || []), ...serviceIds];
      } else {

        this.baseGridService.createData<Tooth>(this.endpointRoutes.tooth.main, {
          toothPosition: toothPosition,
          odontogramId: odontogramId,
          serviceIds: serviceIds,
          status: 5,
          toothName: `${ToothNames[toothPosition]}`
        }).subscribe({
          next: (newTooth) => {
            this.patientOdontogram.tooth.push(newTooth);
          },
          error: (error) => {
            console.error('Error al crear el diente:', error);
          }
        });
      }
    });

    const odontogramToUpdate = {
      patientId: this.patientOdontogram.id,
      tooth: this.patientOdontogram.tooth.map(({ toothPosition, serviceIds }) => ({
        toothPosition,
        serviceIds
      }))
    };

    if (this.patientOdontogram.id) {
      this.baseGridService.updateData(this.endpointRoutes.odontogram.main, odontogramToUpdate, this.patientOdontogram.id)
        .subscribe({
          next: () => console.log('Odontograma actualizado correctamente'),
          error: (error) => console.error('Error al actualizar el odontograma:', error)
        });
    }
  }

  deleteAppointment(id: number) {
    this.baseGridService.deleteData<Appointment>(this.endpointRoutes.appointment.main, id).subscribe({
      next: (response: any) => {
        console.log('Cita eliminada con éxito:', response);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al eliminar la cita:', error);
      }
    });
  }

  async getAllServices(): Promise<void> {
    try {
      this.servicesList = await lastValueFrom(this.servicesService.getServices());
    } catch (error) {
      console.error('Error al obtener los servicios:', error);
    }
  }

  getAllPatients() {
    this.baseGridService.getData<Patient[]>(this.endpointRoutes.patient.main).subscribe({
      next: (patients: any) => {
        this.patientList = patients;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  goToNextStep(): void {
    this.currentStep++;
  }

  goToPreviousStep(): void {
    this.currentStep--;
  }

  isStepVisible(step: number): boolean {
    return this.currentStep === step;
  }

  updateDue(due: Dues, id: number) {
    this.duesService.updateDue(due, id).subscribe({
      next: (response: any) => {
        console.log('Updateado, ', response)
      }
    })
  }

  filterServices(list: ServiceOrDue[] | ServiceOrDue | null | undefined): (number | string)[] {
    if (!Array.isArray(list)) {
      if (!list) return [];
      list = [list];
    }
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
      if (due.id !== undefined) {

        return lastValueFrom(this.duesService.patchDue(due.id, {
          totalCost: due.totalCost

        }));
      } else {
        console.error('Intento de actualizar un Due sin ID válido:', due);
        return Promise.reject('ID inválido');
      }
    });

    try {
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Hubo un error al actualizar los Dues:', error);
      throw error;
    }
  }

  async dueCost(selectedDues: Dues[]): Promise<number> {
    let totalDueCost = 0;
    for (const due of selectedDues) {
      if (due.itemType === 'due') {

        totalDueCost += due.totalCost;
      }
    }
    this.componentDueCost = totalDueCost;
    return totalDueCost;
  }

  async submitForm() {
    if (!this.appointmentForm.valid) {
      this.showMessage('El formulario no es válido.');
      return;
    }
    
    const formValue = this.appointmentForm.getRawValue();
    
    let dueAmountForAppointment = 0;
    if (this.selectedDue && this.showDueInput) {
      dueAmountForAppointment = this.duePaymentAmount;
      if (isNaN(dueAmountForAppointment) || dueAmountForAppointment <= 0) {
        this.showMessage('Debe ingresar un monto válido para el pago de la cuota');
        return;
      }
      if (dueAmountForAppointment > this.selectedDue.totalCost) {
        this.showMessage('El monto ingresado excede el total pendiente de la cuota');
        return;
      }
    }

    let normalServicesCost = 0;
    const selectedItem = this.combinedList.find(item => item.id === formValue.serviceIds);
    if (selectedItem && selectedItem.itemType === 'service') {
      normalServicesCost = selectedItem.cost;
    }
    
    const appointmentTotalCost = normalServicesCost + dueAmountForAppointment;

    const date = new Date(formValue.appointmentDate);
    const [hours, minutes] = formValue.appointmentHour.split(':').map(Number);
    date.setHours(hours, minutes);

    let serviceIdToSend: number;
    if (this.selectedDue && this.selectedDue.itemType === 'due') {
      serviceIdToSend = Number(this.selectedDue.serviceId);
    } else {
      serviceIdToSend = formValue.serviceIds;
    }

    const submission = {
      ...formValue,
      serviceIds: [serviceIdToSend],
      duesCost: dueAmountForAppointment,
      totalCost: appointmentTotalCost,
      appointmentDate: date.toISOString(),
    };
    
    delete submission.appointmentHour;
    
    try {
      if (this.updating) {
        await lastValueFrom(this.appointmentService.updateAppointment(submission, this.appointmentId));
        this.showMessage('Cita actualizada con éxito.');
      } else {
        await lastValueFrom(this.appointmentService.createAppointment(submission));
        this.showMessage('Cita registrada con éxito.');
      }
    } catch (error) {
      this.showMessage('Error al procesar la cita.');
      return; 
    }
    
    if (this.selectedDue && this.selectedDue.id !== undefined) {
      const newTotalDue = this.selectedDue.totalCost - dueAmountForAppointment;
      try {
        await lastValueFrom(
          this.duesService.patchDue(this.selectedDue.id, { totalCost: newTotalDue })
        );
        this.showMessage('Cuota actualizada correctamente.');
      } catch (error) {
        this.showMessage('Error actualizando la cuota.');
      }
    }
    try {
      await this.getOdontogramByPatientId(this.patientId);

      if (this.patientOdontogram && this.patientOdontogram.id) {
 
        await this.assignServicesToTooths([serviceIdToSend], this.patientOdontogram.id);
        this.redirect(this.redirectToClient)
      }
    } catch (error) {
      this.showMessage('Error al actualizar el odontograma.');
    }
  }
  
  
}
