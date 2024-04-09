import { Categories } from "./product.interface";

export interface Instrument {
    name:string;

    unitDate:Date;

    notes?:string;

    expiryDate:Date;

    instrumentalState?:boolean;

    categoryProduct: Categories;
}