export interface Appointment {
    id?:string;
    appointmentDate: string;
    notes?: string;
    servicesName: string[];
    patientId: number;
    patientName: string;
}