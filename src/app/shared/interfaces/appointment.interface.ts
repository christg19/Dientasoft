import { Dues } from "./dues.interface";
import { Service } from "./services.interface";

export interface Appointment {
    id:number;
    appointmentDate: string;
    notes?: string;
    serviceIds:number[];
    patientId: number;
    totalCost?: number;
    patientName: string;
   
}