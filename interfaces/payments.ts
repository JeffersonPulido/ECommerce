import { IOrder, IProduct } from ".";

export interface IPayments {
    _id: string;
    item: IProduct;
    orderId: IOrder | string;
    itemId: IProduct | string;
    total: number;
    comission: number;
    status: boolean;
    quantityBuy: number;
    createdAt?: string;
    updatedAt?: string;
    producto?: IProduct | string;
    vendorName?: string | '';
}
