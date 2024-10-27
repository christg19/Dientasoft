import { Categories } from "./product.interface";

export interface Instrument {
    id:string;

    name:string;

    unitDate:Date;

    notes?:string;

    expiryDate:Date;

    instrumentalState?:boolean;

    categoryProduct: Categories;
}