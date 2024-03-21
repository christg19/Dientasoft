export interface Appointment {
    appointmentDate: Date;
    notes?: string;
    servicesName: string[];
    patientId: number;
    patientName: string;
}