import { ToothStatus } from '../const/enums/tooth.enum';

export interface Tooth {

    id?:number;

    toothPosition:number;

    toothName: number | string;

    status:ToothStatus;

    serviceIds:number[];

    odontogramId: number;

}

