import { IOrder, IProduct } from ".";

export interface IPayments {
    _id: string;
    item: IProduct;
    orderId: IOrder | string;
    orderPayStatus: boolean;
    itemId: IProduct | string;
    total: number;
    comission: number;
    status: boolean;
    quantityBuy: number;
    createdAt?: string;
    updatedAt?: string;
    producto?: IProduct | string;
    vendorName?: string | "";
    shippingStatus?: boolean;
    transportationName?: string | "";
    guideNumber?: string | "";
}
