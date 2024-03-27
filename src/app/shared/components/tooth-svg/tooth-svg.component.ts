import { Component, Input, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../interfaces/appointment.interface';

@Component({
  selector: 'app-tooth-svg',
  templateUrl: './tooth-svg.component.html',
  styleUrls: ['./tooth-svg.component.scss']
})
export class ToothSVGComponent {
  @ViewChild('toothContent') toothContent!: TemplateRef<any>;
  @Input() patient!: string;

  dialogRef!: MatDialogRef<any>;
  public patientAppointmentList!: Appointment[];

  constructor(public dialog: MatDialog, private appointmentsService: AppointmentService) {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['patient']) {
      console.log('Patient ID ha cambiado:', this.patient);

    }
  }

  ngOnInit():void {
    this.getAppointments();
  }

  ngAfterViewInit() {
    for (let i = 1; i <= 32; i++) {
      let toothPath = document.querySelector(`path#tooth-${i}`);
      if (toothPath) {
        toothPath.addEventListener('click', () => {
          console.log(`Clicked on tooth-${i} with native JS`);
          this.onToothClick(`tooth-${i}`)
        });
      }
    }
  }

  onToothClick(event: MouseEvent | string): void {
    let element;
    if (event instanceof MouseEvent) {
      element = event.target as HTMLElement;
    }
    this.openModal(this.toothContent)
  }

  getAppointments() {
    this.appointmentsService.getAppointments().subscribe({
      next: (appointments: any) => {
        this.patientAppointmentList = appointments.filter((appointment:any)=> appointment.patientId === this.patient)
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  openModal(templateRef: any) {
    this.dialogRef = this.dialog.open(templateRef, {
      width: '80%',
      height: 'auto',
    });
  }
}
