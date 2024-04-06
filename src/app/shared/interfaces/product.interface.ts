export enum Categories {
    CHEMICAL = "Quimico",
    DISPOSABLE = "Desechable",
    INSTRUMENTAL = "Instrumento"
}

export interface Product {
    name:string;
    unitDate:Date;
    notes?:string;
    expiryDate?:Date;
    instrumentalState?:boolean;
    categoryProduct: Categories
}
