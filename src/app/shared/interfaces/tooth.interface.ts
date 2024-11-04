import { ToothStatus } from '../const';

export interface Tooth {

    id?:number;

    position:number;

    status:ToothStatus;

    serviceIds:number[];

}