export interface Service {
    id:number;
    name: string;
    cost: number;
    duesQuantity:number;
    productIds:string[]
    itemType:'service';
}