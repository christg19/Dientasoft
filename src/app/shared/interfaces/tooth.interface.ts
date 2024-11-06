import { ToothStatus } from '../const';

export interface Tooth {

    id?:number;

    toothPosition:number;

    status:ToothStatus;

    serviceIds:number[];

    odontogramId: number;

}

