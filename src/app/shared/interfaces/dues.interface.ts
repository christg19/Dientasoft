import { Service } from "./services.interface";

export interface Dues {
    createdAt: string | number | Date;
    id?: number;

    name?: string;

    patientId: number;

    serviceId: number | string;

    dueQuantity: number;

    totalCost: number;

    originalTotalCost?: number;
    originalDueQuantity?: number

    itemType: 'due';


}


export type SelectableObject = {
    itemType: 'service' | 'due';

};

export type ServiceOrDue = Service | Dues;