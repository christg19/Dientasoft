import { Service } from "./services.interface";

export interface Dues {
    id?:number;

    name?:string;
    
    patientId: number;

    serviceId: number | string;

    dueQuantity: number;

    totalCost: number;

    itemType:'due';
    
    
}


export type SelectableObject = {
    itemType: 'service' | 'due';

  };

  export type ServiceOrDue = Service | Dues;