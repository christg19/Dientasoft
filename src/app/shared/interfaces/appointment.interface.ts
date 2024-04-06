export interface Appointment {
    id?:string;
    appointmentDate: string;
    notes?: string;
    servicesName: string[];
    serviceIds?:number[];
    service?:any[];
    patientId: number;
    patientName: string;
}