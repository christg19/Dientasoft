import { Service } from "./services.interface";

export interface Appointment {
    id:string;
    appointmentDate: string;
    notes?: string;
    serviceIds:number[];
    patientId: number;
    patientName: string;
}