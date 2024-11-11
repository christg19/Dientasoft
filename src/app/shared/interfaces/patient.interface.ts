import { Appointment } from "./appointment.interface";
import { Dues } from "./dues.interface";

export interface Patient {
    id?:number;
    name:string;
    age:number;
    address?:string;
    tel?:string;
    email?:string;
    appointments?:Appointment[];
    dues?:Dues[];
}