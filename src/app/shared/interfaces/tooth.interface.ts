import { ToothStatus } from '../const';

export interface Tooth {

    position:number;

    status:ToothStatus;

    serviceIds:number[];

}