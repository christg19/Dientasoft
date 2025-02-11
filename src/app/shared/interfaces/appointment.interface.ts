

export enum AppointmentStatus {
  Pendiente = 0,
  Completada = 1,
  Cancelada = 2,
}


export interface Appointment {
    id:number;
    appointmentDate: string;
    notes?: string;
    serviceIds:number[];
    patientId: number;
    totalCost?: number;
    patientName: string;
    status?: AppointmentStatus;
}