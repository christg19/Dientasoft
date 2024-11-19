export enum Categories {
    CHEMICAL = "Quimico",
    DISPOSABLE = "Desechable",
    INSTRUMENTAL = "Instrumento"
}

export interface Product {
    id?:number;
    name:string;
    unitDate:Date;
    notes?:string;
    expiryDate?:Date;
    instrumentalState?:boolean;
    categoryProduct: Categories
}
